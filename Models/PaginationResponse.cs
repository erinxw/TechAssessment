namespace TechAssessment.Models
{
    public class PaginationResponse<T> where T : class
    {
        public int TotalCount { get; set; }
        public int PageSize { get; set; }
        public int CurrentPageNumber { get; set; }
        public int TotalPages { get; set; }
        public bool HasPreviousPage { get; set; }
        public bool HasNextPage { get; set; }
        public T Data { get; set; }

        public PaginationResponse(int totalCount, T data, int currentPageNumber, int pageSize)
        {
            TotalCount = totalCount;
            Data = data;
            CurrentPageNumber = currentPageNumber;
            PageSize = pageSize;

            TotalPages = (int)Math.Ceiling((double)TotalPages / (double)pageSize);

            // For UI
            //HasPreviousPage = CurrentPageNumber > 1;
            //HasNextPage = CurrentPageNumber < TotalPages;
        }
    }
}
