import { HOST } from "./config";

export default async function api(method, endpoint, body=undefined) {
  const res = await fetch(`${HOST}/${endpoint}`, {
    method: method,
		headers: {
			"Content-Type": "application/json",
			"Accept": "application/json"
		},
		credentials: 'include',
    body: JSON.stringify(body),
  });

	if (res.ok) {
		return res.json();
	} else {
		console.log(`Error fetching ${endpoint}`);
		return undefined;
	}
}