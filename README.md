# FloraFauna
----
Link to deployment: _____

Developers:  
Jiatian Wang wang.jiati@northeastern.edu  
Zhiqi Lin lin.zhiq@northeastern.edu  
Zhining Fang fang.zhi@northeastern.edu  

Instructions to run application locally on machine:  
1. Clone Repository
2. In API Directory and UI Directory, run npm install to install dependencies.
3. To run application, run npm start in API directory. In a new terminal and in the UI directory, 
   run npm run watch-server-hmr. In another terminal, run npm start.
Application should run in http://ui.promernstack.com:8000 on the web
   
---
### Project Iteration 1

#### API Functionality:
* Defined GraphQL Schema for Posts, Users, Comments, and Location. Added appropriate schema for
  Queries and Mutations related to Post filtering and CRUD operations.
* Established Atlas MongoDB for project and defined methods for post CRUD operations.
    * Refactored issue code to posts and post related attributes
    

#### UI Functionality:
* Refactored Page code to accommodate map and new side filter panel. 
    * Map currently has a placeholder
    * Filter panel has collapsible filter options
    * Date filter implements a third party calendar component
        * link: https://github.com/arqex/react-datetime
* New Components:
    * Add a post
    * Edit a post
    * View a post
    * View user profile (display list of user posts)
