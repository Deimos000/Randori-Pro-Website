# Use a lightweight Nginx image
FROM nginx:alpine

# Copy your static files to the Nginx html folder
COPY . /usr/share/nginx/html

# Cloud Run expects the container to listen on port 8080[[3](https://www.google.com/url?sa=E&q=https%3A%2F%2Fvertexaisearch.cloud.google.com%2Fgrounding-api-redirect%2FAUZIYQGP7grlPbXdEIn2aLte9m-ySzDtKPsHMWCenqm-DQtjNXNjVNVasSvDTtxoVtMYZ2PfqtovSo37uctmXMmkSzuxdq_AQr2YNmWqdHwiyWFCAzhtlQwBXwzIQI4NAwLD-AYyxRF6do7AIobq287Tyvw1SADSbHOdUNfBLH22mi03BsJczUNGhlqegcGJvWhmkwwOEznxQa0547oDNs831-hipGEfc1Vu7En91AvX-txYzv6J_76w)][[4](https://www.google.com/url?sa=E&q=https%3A%2F%2Fvertexaisearch.cloud.google.com%2Fgrounding-api-redirect%2FAUZIYQEGtHM4aDLM8O8Z5oJBqVnyZA6f9trsugmiYKZ_dl3ZjUCPnQuIqoH-AtMeo_djLl39Vf6lPTgAd7s94xaUI3Z9wnUkv1nbgT1pJiKvoOSF9eZYpg78zI4eRMMspfk-tMnnXAEvUYQo_s_kGKrbGs2wocAsGn-3EtBTKvUjo0U%3D)]
# We need to configure Nginx to listen on 8080 instead of 80
RUN sed -i 's/listen       80;/listen       8080;/g' /etc/nginx/conf.d/default.conf

# Expose port 8080
EXPOSE 8080
```[[3](https://www.google.com/url?sa=E&q=https%3A%2F%2Fvertexaisearch.cloud.google.com%2Fgrounding-api-redirect%2FAUZIYQGP7grlPbXdEIn2aLte9m-ySzDtKPsHMWCenqm-DQtjNXNjVNVasSvDTtxoVtMYZ2PfqtovSo37uctmXMmkSzuxdq_AQr2YNmWqdHwiyWFCAzhtlQwBXwzIQI4NAwLD-AYyxRF6do7AIobq287Tyvw1SADSbHOdUNfBLH22mi03BsJczUNGhlqegcGJvWhmkwwOEznxQa0547oDNs831-hipGEfc1Vu7En91AvX-txYzv6J_76w)][[4](https://www.google.com/url?sa=E&q=https%3A%2F%2Fvertexaisearch.cloud.google.com%2Fgrounding-api-redirect%2FAUZIYQEGtHM4aDLM8O8Z5oJBqVnyZA6f9trsugmiYKZ_dl3ZjUCPnQuIqoH-AtMeo_djLl39Vf6lPTgAd7s94xaUI3Z9wnUkv1nbgT1pJiKvoOSF9eZYpg78zI4eRMMspfk-tMnnXAEvUYQo_s_kGKrbGs2wocAsGn-3EtBTKvUjo0U%3D)]