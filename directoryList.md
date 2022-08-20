|-- 0812
    |-- .DS_Store
    |-- .gitignore
    |-- LICENSE
    |-- README.md
    |-- .github
    |   |-- workflows
    |       |-- codeql-analysis.yml
    |       |-- pages.yml
    |-- client
    |   |-- .env
    |   |-- .gitignore
    |   |-- .prettierrc
    |   |-- craco.config.js
    |   |-- package-lock.json
    |   |-- package.json
    |   |-- tailwind.config.js
    |   |-- tsconfig.json
    |   |-- tsconfig.paths.json
    |   |-- yarn.lock
    |   |-- .vscode
    |   |   |-- settings.json
    |   |-- public
    |   |   |-- _redirects
    |   |   |-- index.html
    |   |   |-- manifest.json
    |   |   |-- robots.txt
    |   |   |-- images
    |   |       |-- favicon.ico
    |   |       |-- logo192.png
    |   |       |-- logo512.png
    |   |-- src
    |       |-- App.tsx
    |       |-- index.tsx
    |       |-- react-app-env.d.ts
    |       |-- react-window.d.ts
    |       |-- settings.json
    |       |-- api
    |       |   |-- PostApi.ts
    |       |   |-- UserApi.tsx
    |       |   |-- base.tsx
    |       |   |-- text.js
    |       |-- components
    |       |   |-- Feed.tsx
    |       |   |-- Form
    |       |   |   |-- AddPost.tsx
    |       |   |   |-- EditProfile.tsx
    |       |   |   |-- Input.tsx
    |       |   |-- Navbar
    |       |   |   |-- Navbar.tsx
    |       |   |-- Popup
    |       |   |   |-- DeleteBox.tsx
    |       |   |-- Post
    |       |   |   |-- AddComment.tsx
    |       |   |   |-- Comment.tsx
    |       |   |   |-- CustomPost.tsx
    |       |   |   |-- Post.tsx
    |       |   |   |-- PostIcons.tsx
    |       |   |   |-- PostsList.tsx
    |       |   |-- Search
    |       |   |   |-- Search.tsx
    |       |   |   |-- SearchField.tsx
    |       |   |-- Sidebar
    |       |       |-- LeftSidebar.tsx
    |       |       |-- RightSidebar.tsx
    |       |       |-- UserList.tsx
    |       |-- hooks
    |       |   |-- useAuth.tsx
    |       |   |-- useSingleUser.tsx
    |       |-- redux
    |       |   |-- store.ts
    |       |   |-- slices
    |       |       |-- userSlice.ts
    |       |-- screens
    |       |   |-- ChatScreen.tsx
    |       |   |-- HomeScreen.tsx
    |       |   |-- LoginScreen.tsx
    |       |   |-- ProfileScreen.tsx
    |       |   |-- ProtectedRoute.tsx
    |       |   |-- RegisterScreen.tsx
    |       |   |-- SearchScreen.tsx
    |       |   |-- UserScreen.tsx
    |       |-- shared
    |       |   |-- Avatar.tsx
    |       |   |-- Button.tsx
    |       |   |-- Image.tsx
    |       |   |-- Loader.tsx
    |       |   |-- Modal.tsx
    |       |   |-- SaveIcon.tsx
    |       |   |-- SmallSpinner.tsx
    |       |   |-- SuspenseWrapper.tsx
    |       |-- styles
    |       |   |-- base.css
    |       |   |-- tailwind.css
    |       |-- types
    |           |-- CommentInterfaces.ts
    |           |-- PostInterfaces.ts
    |           |-- UserInterfaces.ts
    |-- server
        |-- .DS_Store
        |-- .env
        |-- .eslintrc.json
        |-- .gitignore
        |-- .prettierrc
        |-- Procfile
        |-- nodemon.json
        |-- package-lock.json
        |-- package.json
        |-- tsconfig.json
        |-- yarn.lock
        |-- .vscode
        |   |-- settings.json
        |-- @types
        |   |-- express
        |       |-- index.d.ts
        |-- src
            |-- .DS_Store
            |-- index.js
            |-- index.ts
            |-- config
            |   |-- db.js
            |   |-- db.ts
            |-- controllers
            |   |-- commentController.js
            |   |-- commentController.ts
            |   |-- postController.js
            |   |-- postController.ts
            |   |-- userController.js
            |   |-- userController.ts
            |-- middlewares
            |   |-- authenticate.js
            |   |-- authenticate.ts
            |   |-- cloudinaryConfig.js
            |   |-- cloudinaryConfig.ts
            |   |-- upload.js
            |   |-- upload.ts
            |-- models
            |   |-- Comment.js
            |   |-- Comment.ts
            |   |-- Post.js
            |   |-- Post.ts
            |   |-- User.js
            |   |-- User.ts
            |-- routes
            |   |-- commentRoutes.js
            |   |-- commentRoutes.ts
            |   |-- postRoutes.js
            |   |-- postRoutes.ts
            |   |-- userRoutes.js
            |   |-- userRoutes.ts
            |-- utils
                |-- generateToken.js
                |-- generateToken.ts
