# Sphere

## Goals
  - create secure api gateway, which handles application logic
    - [X] create google sheet playground table
    - [X] change like/dislike http method from GET to POST
      - [X] on client
      - [X] on google apps script
    - [X] create serverless api gateway which filters non-logged-in users
    - [X] create serverless api gateway which manages requests
      - [X] locally (as a nodejs app)
      - [X] as serverless function
    - [X] create and deploy serverless function which deletes song from playlist if dislike happened
    - [X] create a foundation for serverless function (create package.json and add additional dependencies)
    - [X] [optional for now] set environment variables for google sheet web app
    - [X] [optional for now] set environment variables for users and their predefined passwords
  - create frontend login auth logic
    - [X] show popup
    - [X] store password in local storage
    - [X] check if user is logged-in. if not logged-in -> show login popup 
    - [X] show error message if password is incorrect
  - connect frontend with backend
    - [X] connect test frontend page with test backend locally (not via serverless function for now)
    - [X] connect frontend auth with backend
  - misc (other)
    - [ ] make like/dislike request only after song ends
    - [ ] check if client uses adblock (because adblock blocks like/dislike requests)
    - [X] create script, which creates zip for serverless function provider (create "serverless function bundle")
