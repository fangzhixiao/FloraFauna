# FloraFauna

----
Jiatian Wang   wang.jiati@northeastern.edu
Zhiqi Lin lin.zhiq@northeastern.edu

1. Clone Repository
2. In API Directory and UI Directory, run npm install to install dependencies.
3. To run application, run npm start in API directory. In a new terminal and in the UI directory, run npm run watch-server-hmr. In another terminal, run npm start.
Application should run in http://ui.promernstack.com:8000 on the web


![Alt text]()

In front-end, we implemented google map api to render maps. The filter is on the top of the website, and there is a "Find me" Button, when clicking, it will locate to your 
location, and there is a search field, which I import "use-places-autocomplete" package, you can search location there, and it will give you some hint there also.
The initial state of map depends on the range of posts. It will include all post at start. Each pin represent a post. If you click on it, it will give you more details about 
the post. 

ToDo: As you can see in PostMap.jsx, there is a json input on the top. Which means the data are not from back-end right now. Will implement that later. Also, the website will
looks better. Right now there is a lot of inline style of React component.