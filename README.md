This is Landing Page
Methob POST
URL:"https://link-shortener-express.vercel.app/api/shorten"
REQUEST
{
  "link": "https://facebook.com/123456/123456/123456"
}

This is login page
Methob POST
URL:"https://link-shortener-express.vercel.app/auth/login"
REQUEST
{
  "email": "test@gmail.com",
  "password": "test123"
}

This is signup page
Methob POST
URL:"https://link-shortener-express.vercel.app/auth/signup"
REQUEST
{
  "username":"test",
  "email": "test@gmail.com",
  "password": "test123"
}

This is link for get expires_at that froutend need
Methob GET
URL:"https://link-shortener-express.vercel.app/api/shorten/:shortUrl/expires"


For page Admin CRUD API
This is link for post admin
methob POST
URL:"https://link-shortener-express-1.vercel.app/api/admin/users"
REQUEST
{
    "username":"laiheang",
     "email":"laiheang@gmail.com",
     "password":"H1233"
}

This is link for get admin
methob GET
URl:"https://link-shortener-express-1.vercel.app/api/admin/users"

This is link for get admin by Id
methob GET
URl:"https://link-shortener-express-1.vercel.app/api/admin/users/1"

This is link for update admin
methob PUT
URL:"https://link-shortener-express-1.vercel.app/api/admin/users/1"
REQUEST
{
    "username":"laiheang",
     "email":"laiheang@gmail.com",
     "password":"H1233"
}

This is link for delete admin by Id
methob delete
URl:"https://link-shortener-express-1.vercel.app/api/admin/users/1"
