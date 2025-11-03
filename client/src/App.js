import Home from './Components/Home.js'
import Nav from './Components/Nav.js';
import {
  createBrowserRouter,
  RouterProvider,
  Route,
  Link,
} from "react-router-dom";


function App() {
  return (
    <>
      <Nav/>
      <Home/>
    </>
  );
}

export default App;
 