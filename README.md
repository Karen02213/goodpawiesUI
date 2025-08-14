# Local Development with Custom Domain and Nginx

To use a custom domain (goodpawies.local) for both the React app and API:

1. Add to your /etc/hosts:
	```
	127.0.0.1 goodpawies.local
	```
2. Use the provided Nginx config in `nginx/goodpawies.local.conf`:
	- Proxy /api/ to backend (localhost:5000)
	- Proxy / to React app (localhost:3000)
3. Enable the config:
	```bash
	sudo ln -s /path/to/nginx/goodpawies.local.conf /etc/nginx/sites-enabled/
	sudo nginx -t
	sudo systemctl reload nginx
	```
4. Set `REACT_APP_API_URL` in `client/.env` to `http://goodpawies.local/api`
5. Start the backend and frontend as usual.

Now you can access your app at http://goodpawies.local
# goodpawiesUI
