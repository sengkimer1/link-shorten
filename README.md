### Project Setup and Running
**1.Clone the repository**
```bash
git clone https://github.com/your-repo/example
cd example
```
**2.Install Dependencies**
```bash
npm install
```
**3.Create .env File Set up environment variables in a .env file:**
```bash
DATABASE_URL=postgres://username:password@localhost:5432/database
PORT=5000
JWT_SECRET=your_jwt_secret
```
**4.Run Database Migrations**
```bash
npm run migrate
```
**5.Start the Server**
```bash
npm start
```
### This is Landing Page
**Method** `POST`
**URL:** `https://link-shorten-two.vercel.app/api/shorten`
```json
REQUEST
{
  "link": "https://facebook.com/123456/123456/123456"
}
```

### This is login page
**Method** `POST`
**URL:** `https://link-shorten-two.vercel.app/auth/login"`
```json
REQUEST
{
  "email": "test@gmail.com",
  "password": "test123"
}
```

### This is signup page
**Method** `POST`
**URL:** `https://link-shorten-two.vercel.app/auth/signup`
```json
REQUEST
{
  "username":"test",
  "email": "test@gmail.com",
  "password": "test123"
}
```

### This is link for get expires_at that froutend need
**Method** `GET`
**URL:**`https://link-shorten-two.vercel.app/api/shorten/:shortUrl/expires`


### Admin CRUD API

**This is the link ues for view all link admin.**
**Method** `GET`
**URL:** `https://back-link-shorter-133v.vercel.app/admin/links`


**This is the link ues for delete link admin.**
**Method** `DELETE`
**URL:** `https://back-link-shorter-133v.vercel.app/admin/links/1"`

**This is the link ues up update all link admin.**
**Method** `PUT`
**URL:** `https://back-link-shorter-133v.vercel.app/admin/links/1`

```json

Take it to test in Postman
{
"username": "Jonh",
"password": "Jonh123"
}

Respon
{
      "code": 200,
    "users": {
        "user_1": {
            "username": "Jonh",
            "list_of_converted_links": {
                "https://www.youtube.com/watch?v=XwPDxTBIRSc&list=RDXwPDxTBIRSc&start_radio=1": "i4agj",
                "https://www.youtube.com/watch?v=YMvrk9sH0u4": "t4s87",
            }
        },
        "user_2": {
            "username": "Jack",
            "list_of_converted_links": {
                "https://www.youtube.com/watch?v=XwPDxTBIRSc&list=RDXwPDxTBIRSc&start_radio=1": "https://short.ly/0g9w8",
                "https://www.youtube.com/watch?v=BjdLmwFp9kE&list=RDXwPDxTBIRSc&index=5": "https://short.ly/khwdh"
            }
        },
    }
}
```


### Custom Aliases API

**This is the link use for get covert custom_link**
**Method** `post`
**URL:** `https://back-link-shorter-133v.vercel.app/api/custom-aliases`

**This is the link use for post covert custom_link**
**Method** `POST`
**URL:** `https://back-link-shorter-133v.vercel.app/api/custom-aliases`


```json

Take it to test in Postman
{
  "original_link": "https://example13.com",
  "custom_link": "test13"
}

Respon
{
    "code": 200,
    "converted_custom_links": {
        "1": {
            "original_link": "https://example12.com",
            "converted_custom_link": "https://bi-kay.com/test"
        },
        "2": {
            "original_link": "https://example13.com",
            "converted_custom_link": "https://bi-kay.com/test13"
        }
    }
}
```

### URL SHORTEN API

**This is the link use for shorten api**
**Method** `POSt`
**URL:** `https://link-shorten-two.vercel.app/api/shorten`
```json
REQUEST
{
  "link": "https://facebook.com/123456/123456/123456"
}
```
### Admin Report
**This is the link use for post report**
**Method** `POST`
**URL:** `https://link-shorten-two.vercel.app/api/report/report`
```json
REQUEST
{
    "code": 200,
    "report": {
        "total_conversions": "0",
        "active_users": "0",
        "top_links": [
            {
                "original_url": "https://www.new-url.com/",
                "short_url": "newshorturl",
                "total_clicks": "1"
            }
        ],
        "user_activity": [
            {
                "user_id": null,
                "conversions": "1",
                "total_clicks": "1"
            }
        ],
        "daily_stats": [
            {
                "date": "2024-09-16T00:00:00.000Z",
                "conversions": "1",
                "total_clicks": "1"
            }
        ]
    }
}

```
**This is the link use for post link report**
**Method** `POST`
**URL:** `https://link-shorten-two.vercel.app/api/report/link-report`
```json
REQUEST
{
    "code": 200,
    "link_report": {
        "code": 200,
        "data": {
            "original_url": "https://www.google.com/",
            "short_url": "3eafe3f2",
            "created_by": null,
            "expires_at": "2024-09-16T05:44:20.920Z",
            "total_clicks": "0",
            "daily_clicks": []
        }
    }
}
```
