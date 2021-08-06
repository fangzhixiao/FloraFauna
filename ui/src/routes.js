import PostMap from './PostMapWrapper.jsx';
import PostEdit from './PostEdit.jsx';
import About from './About.jsx';
import NotFound from './NotFound.jsx';

const routes = [
  { path: '/posts', component: PostMap }, // make this map
  { path: '/edit/:id', component: PostEdit },
  { path: '/about', component: About },
  { path: '*', component: NotFound },
];

export default routes;
