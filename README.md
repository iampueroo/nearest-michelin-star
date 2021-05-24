# Nearest Michelin Star
Check out live at https://nearestmichelinstar.com/, a website to find the nearest Michelin starred restaurant to your current location (currently only supports restaurants in the United States).

I initially bought the domain after being frustrated at how hard it was to find the nearest michelin star restaurant to me. I built the website over the course of a day, spending most of the time figuring out how to get the data (interestingly, there doesn't seem to be any dataset or API that is a trustworthy source of truth. I ended up pulling the data dynamically from websites, but only for restaurants in the United States.

### Development Details
Currently (May 2021) this is as simple as it gets - one `index.html` file and one `index.js` file.

### Plans Forward
I'm hoping to:
1. Add **all** restaurants, not just USA restaurants.
2. Extract website's URL and show it on the table (include more helpful follow up action)
3. Add one-star, two-star, three-star filters
