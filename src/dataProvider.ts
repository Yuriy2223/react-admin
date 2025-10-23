// import simpleRestProvider from "ra-data-simple-rest";
// import { fetchUtils } from "react-admin";

// const httpClient = (url: any, options: any) => {
//   options.user = {
//     authenticated: true,
//     token: `Bearer ${localStorage.getItem("token")}`,
//   };
//   try {
//     return fetchUtils.fetchJson(url, options);
//   } catch (error) {
//     throw error;
//   }
// };

// const apiUrl = import.meta.env.VITE_API_URL;

// export const dataProvider = simpleRestProvider(apiUrl, httpClient);

// export default apiUrl;

import simpleRestProvider from "ra-data-simple-rest";
import {fetchUtils} from "react-admin";

const httpClient = (url: any, options: any) => {
    options.user = {
        authenticated: true,
        token: `Bearer ${localStorage.getItem("token")}`,
    };
    return fetchUtils.fetchJson(url, options);
};

// const httpClient = (url:any, options:any) => {
//     options.user = {
//         authenticated: true,
//         token: `Bearer ${localStorage.getItem("token")}`,
//     };
//
//     return fetchUtils.fetchJson(url, options)
//         .then(({ json }) => {
//             // Ensure the response has the required structure
//             if (json && json.data && !json.data.id) {
//                 // Add the id if it's missing (optional modification)
//                 json.data.id = json.data.id || json.data.someUniqueField; // Adjust this based on your response
//             }
//             return { data: json.data }; // Return the data wrapped in 'data' as required
//         })
//         .catch((error) => {
//             throw error;
//         });
// };

const apiUrl = import.meta.env.VITE_API_URL;

export const dataProvider = simpleRestProvider(apiUrl, httpClient);

export default apiUrl;