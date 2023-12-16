import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createBrowserRouter, useNavigate } from 'react-router-dom';
import { Login } from './Components/Pages/Login.jsx';
import { AuthProvider } from './AuthContext.jsx';
import Root from './Components/Root.jsx';
import Error from './Components/Pages/Error.jsx';
import Home from './Components/Pages/Home.jsx';
import Palia from './Components/Pages/Palia.jsx';
import Message from './Components/Pages/Message.jsx';

const router = createBrowserRouter([
	{
		path: '/login',
		element: <Login/>
	},
	{
		path: '/',
		element: <Root/>,
		errorElement: <Error/>,
		children: [
			{ path: 'home', element: <Home/> },
			{ path: 'palia', element: <Palia/> },
			{ path: 'message', element: <Message/> }
		]
	},
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <RouterProvider router={router}/>
  </AuthProvider>
);