export default function FilterHomeFilter() {
    return (
      <div className="max-w-screen-lg mx-1 mt-10 px-4">
      
  
        <div className="flex flex-wrap justify-between gap-4">
          {/* Genre */}
          <div className="w-full sm:w-1/2 md:w-1/5">
            <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base" htmlFor="category">
              Genre
            </label>
            <select
              id="category"
              className="w-full border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-gray-100 transition duration-300 ease-in-out"
            >
              <option value="action">Action</option>
              <option value="comedy">Comedy</option>
              <option value="drama">Drama</option>
              <option value="horror">Horror</option>
              <option value="romance">Romance</option>
            </select>
          </div>
  
          {/* Country */}
          <div className="w-full sm:w-1/2 md:w-1/5">
            <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base" htmlFor="country">
              Country
            </label>
            <select
              id="country"
              className="w-full border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-gray-100 transition duration-300 ease-in-out"
            >
              <option value="usa">USA</option>
              <option value="uk">UK</option>
              <option value="india">India</option>
              <option value="japan">Japan</option>
              <option value="france">France</option>
            </select>
          </div>
  
          {/* Year */}
          <div className="w-full sm:w-1/2 md:w-1/5">
            <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base" htmlFor="year">
              Year
            </label>
            <select
              id="year"
              className="w-full border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-gray-100 transition duration-300 ease-in-out"
            >
              <option value="2024">2024</option>
              <option value="2023">2023</option>
              <option value="2022">2022</option>
              <option value="2021">2021</option>
              <option value="2020">2020</option>
            </select>
          </div>
  
          {/* Now Showing */}
          <div className="w-full sm:w-1/2 md:w-1/5">
            <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base" htmlFor="nowShowing">
              Now Showing
            </label>
            <select
              id="nowShowing"
              className="w-full border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-gray-100 transition duration-300 ease-in-out"
            >
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>
  
          {/* Xem nhiều nhất */}
        
        </div>
      </div>
    );
  }
  