import PostMap from './PostMap.jsx';
import About from './About.jsx';
import NotFound from './NotFound.jsx';

const routes = [
  { path: '/posts', component: PostMap }, // make this map
  { path: '/about', component: About },
  { path: '*', component: NotFound },
];

export default routes;
