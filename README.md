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
# This is Landing Page

**Method** `POST`

**URL:** `https://link-shorten-two.vercel.app/api/shorten`

```json
REQUEST
{
  "link": "https://facebook.com/123456/123456/123456"
}
```

# This is login page

**Method** `POST`

**URL:** `https://link-shorten-two.vercel.app/auth/login"`

```json
REQUEST
{
  "email": "test@gmail.com",
  "password": "test123"
}
```

# This is signup page

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


# Admin DASDBOARD 
### Need token admin

**This is the link ues for view all link from user id admin.**

**Method** `GET`

**URL:** `https://link-shorten-two.vercel.app/api/links`


**This is the link ues for view all link admin.**

**Method** `GET`

**URL:** `https://link-shorten-two.vercel.app/api/link_all`

**This is the link ues for view information from short link admin.**

**This is link for count click.**
 
 **Method:** `POST`

 **URL:**`https://link-shorten-two.vercel.app/api/count/:shortUrl`

```json
EXAMPLE:
https://link-shorten-two.vercel.app/api/count/60acfe58

```
 

**Method** `GET`

**URL:** `https://link-shorten-two.vercel.app/api/links/view/:shortUrl`

**This is the link ues for delete link admin.**

**Method** `DELETE`

**URL:** `https://link-shorten-two.vercel.app/api/links/:shortUrl"`

```json
EXAMPLE:
https://link-shorten-two.vercel.app/api/links/60acfe58

```

**This is the link ues up update all link admin.**

**Method** `PUT`

**URL:** `https://link-shorten-two.vercel.app/api/links/:shortUrl`

```json
EXAMPLE:
https://link-shorten-two.vercel.app/api/links/60acfe58
REQUEST
{
  "original_url": "https://updated-original-url.com",
  "new_short_url": "newshort123"
}
```


# Custom Aliases API
 
### Need token admin

**This is the link use for get covert custom_link**

**Method** `GET`

**URL:** `https://link-shorten-two.vercel.app/api/custom/custom-aliases`

**This is the link use for post covert custom_link**

**Method** `POST`

**URL:** `https://link-shorten-two.vercel.app/api/custom/custom-aliases`


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

# URL SHORTEN API

### Need token user

**This is the link use for shorten api**

**Method** `POST`

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

**URL:** `https://link-shorten-two.vercel.app/api/admin/report`
```json
REQUEST
{
  "start_date": "2024-01-01",
  "end_date": "2024-01-31",
}


```
**This is the link use for post link report**

**Method** `POST`

**URL:** `https://link-shorten-two.vercel.app/api/admin/link-report`
```json
REQUEST
{
  "shortened_link": "abc123"
}

```
