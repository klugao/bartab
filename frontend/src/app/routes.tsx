import { createBrowserRouter } from 'react-router-dom';
import Layout from '../components/Layout';
import Home from '../pages/Home';
import TabDetail from '../pages/TabDetail';
import Customers from '../pages/Customers';
import Items from '../pages/Items';
import Reports from '../pages/Reports';
import Debts from '../pages/Debts';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'tab/:id',
        element: <TabDetail />,
      },
      {
        path: 'customers',
        element: <Customers />,
      },
      {
        path: 'items',
        element: <Items />,
      },
      {
        path: 'reports',
        element: <Reports />,
      },
      {
        path: 'debts',
        element: <Debts />,
      },
    ],
  },
]);
