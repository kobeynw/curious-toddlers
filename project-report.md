# Project Report

## Summary
A website dedicated to helping parents have resources to help their children develop physically, mentally, and emotionally. It provides a repository of activities, a calendar that parents can plan and record activities on for the week, and a page for learning the Montessori methodology for helping children learn and explore.

## MySQL ERD
![curious-toddlers-erd](./curious-toddlers-erd.jpg)

## System design
![curious_toddlers_system_design](./curious_toddlers_system_design.svg)

## Demo
Visit https://curioustoddlers.com and poke around on the live website!

## Takeaways
- I learned about hosting services for frontend, backend, and database - I used Vercel for the frontend, DigitalOcean for the backend and mySQL database (hosted on the same droplet)
- I learned about CI/CD by creating a github actions pipeline that automatically tests and deploys frontend content, backend services, and database migrations
- I learned how to use AI tools effectively in development by utilizing Claude Code skills, plan mode, and code review.

## AI usage
I utilized Claude Code to help me create this website. I used a workflow for most features: use planning mode to create a feature spec, use an implementation skill to implement the feature based on the created spec, use a test writing skill to write tests for the new feature, and finally code review all changes. While this approach still required my input and correction, it performed quite well overall. I also used AI to help brainstorm ideas for color palette, activities dummy data, and Montessori learning resources.

## Why this project is interesting to me
This project helped me bring an idea to life that I have had since starting my family. My wife will comment on the fact that she sometimes is at a loss for where to go for activities that are right for our toddler's development stage and learning needs. The goal of this website was to help her and all of the other parents asking those same kinds of questions.

## Database considerations
Right now my database is hosted on the same DigitalOcean droplet as my backend, with not a lot of storage or compute to keep costs low. Because of this, at the current stage things like redundancy, failover strategy, etc are not a high priority. However, I have ensured that only the admin user of the database can perform certain actions to prevent any unauthorized actions. Additionally, because the database is hosted locally on the droplet, and the database is designed with indices on certain columns, performance is efficient.