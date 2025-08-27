using System.Security.Cryptography;
using Microsoft.AspNetCore.Cryptography.KeyDerivation;

public class PasswordHashHandler
{
	private static int _iterationCount = 10000; 
	private static RandomNumberGenerator _randomNumberGenerator = RandomNumberGenerator.Create();

	public static string HashPassword(string password)
	{
		int saltSize = 128 / 8;
		var salt = new byte[saltSize];
		_randomNumberGenerator.GetBytes(salt);
		var subkey = KeyDerivation.Pbkdf2(password, salt, KeyDerivationPrf.HMACSHA256, _iterationCount, 256 / 8);

		var outputBytes = new byte[13 + salt.Length + subkey.Length];
		outputBytes[0] = 0x01;
		WriteNetworkByteOrder(outputBytes, 1, (uint)KeyDerivationPrf.HMACSHA256);
		WriteNetworkByteOrder(outputBytes, 5, (uint)_iterationCount);
		WriteNetworkByteOrder(outputBytes, 9, (uint)saltSize);
		Buffer.BlockCopy(salt, 0, outputBytes, 13, salt.Length);
		Buffer.BlockCopy(subkey, 0, outputBytes, 13 + saltSize, subkey.Length);

		return Convert.ToBase64String(outputBytes);
	}

	public static bool VerifyPassword(string password, string hash)
	{
		try
		{
			var hashedPassword = Convert.FromBase64String(hash);
			var keyDerivationPrf = (KeyDerivationPrf)ReadNetworkByteOrder(hashedPassword, 1);
			var iterationCount = (int)ReadNetworkByteOrder(hashedPassword, 5);
			var saltLength = (int)ReadNetworkByteOrder(hashedPassword, 9);
			if (saltLength < 128 / 8)
			{
				return false;
			}

			var salt = new byte[saltLength];
			Buffer.BlockCopy(hashedPassword, 13, salt, 0, salt.Length);

			var storedSubkeyLength = hashedPassword.Length - 13 - salt.Length;
			if (storedSubkeyLength < 128 / 8)
			{
				return false;
			}

			var storedSubkey = new byte[storedSubkeyLength];
			Buffer.BlockCopy(hashedPassword, 13 + salt.Length, storedSubkey, 0, storedSubkey.Length);

			var subkey = KeyDerivation.Pbkdf2(password, salt, keyDerivationPrf, iterationCount, storedSubkeyLength);
			return CryptographicOperations.FixedTimeEquals(subkey, storedSubkey);
		}
		catch
		{
			return false;
		}
	}

	private static void WriteNetworkByteOrder(byte[] buffer, int offset, uint value)
	{
		buffer[offset + 0] = (byte)(value >> 24);
		buffer[offset + 1] = (byte)(value >> 16);
		buffer[offset + 2] = (byte)(value >> 8);
		buffer[offset + 3] = (byte)(value >> 0);
	}

	private static uint ReadNetworkByteOrder(byte[] buffer, int offset)
	{
		return ((uint)(buffer[offset + 0]) << 24)
			| ((uint)(buffer[offset + 1]) << 16)
			| ((uint)(buffer[offset + 2]) << 8)
			| ((uint)(buffer[offset + 3]));
	}
}