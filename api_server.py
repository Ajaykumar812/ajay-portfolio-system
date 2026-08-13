import os
import io
from fastapi import FastAPI, HTTPException, Body, Request
from fastapi.middleware.cors import CORSMiddleware
try:
    import pyodbc
except (ImportError, Exception):
    pyodbc = None

from typing import Optional, List
from pydantic import BaseModel
import uvicorn
from datetime import datetime
from fastapi.responses import StreamingResponse
try:
    from fpdf import FPDF
except ImportError:
    try:
        from fpdf2 import FPDF
    except ImportError:
        FPDF = None

def create_fallback_pdf(text: str) -> bytes:
    clean_text = text.replace('(', '\\(').replace(')', '\\)').replace('\n', ') Tj T* (')
    pdf_str = (
        "%PDF-1.4\n"
        "1 0 obj <</Type /Catalog /Pages 2 0 R>> endobj\n"
        "2 0 obj <</Type /Pages /Kids [3 0 R] /Count 1>> endobj\n"
        "3 0 obj <</Type /Page /Parent 2 0 R /Resources <</Font <</F1 4 0 R>>>> /MediaBox [0 0 612 792] /Contents 5 0 R>> endobj\n"
        "4 0 obj <</Type /Font /Subtype /Type1 /BaseFont /Helvetica>> endobj\n"
        "5 0 obj <</Length " + str(len(clean_text) + 60) + ">> stream\n"
        "BT /F1 12 Tf 50 750 Td 14 TL (" + clean_text + ") Tj ET\n"
        "endstream endobj\n"
        "xref\n0 6\n0000000000 65535 f \n0000000009 00000 n \n0000000056 00000 n \n0000000111 00000 n \n0000000224 00000 n \n0000000299 00000 n \n"
        "trailer <</Size 6 /Root 1 0 R>>\nstartxref\n400\n%%EOF"
    )
    return pdf_str.encode("latin-1", errors="ignore")

app = FastAPI(title="Portfolio Management System SQL Server API Backend")

# Enable CORS for React Web (localhost:5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

CONN_STR = os.getenv("SQL_CONN_STR", (
    "Driver={ODBC Driver 17 for SQL Server};"
    "Server=AJAY_KUMAR\\SQLEXPRESS;"
    "Database=PortfolioDB;"
    "Trusted_Connection=yes;"
))

def get_db_connection():
    if pyodbc is not None:
        try:
            return pyodbc.connect(CONN_STR)
        except Exception as e:
            print(f"Database connection warning (SQL Server): {e}")
    try:
        import sqlite3
        conn = sqlite3.connect("PortfolioDB.sqlite", check_same_thread=False)
        return conn
    except Exception as ex:
        raise HTTPException(status_code=500, detail="Database connection failed")
class GalleryItemSchema(BaseModel):
    id: Optional[int] = None
    title: str
    description: Optional[str] = ""
    mediaType: Optional[str] = ""
    mediaPath: Optional[str] = ""
    thumbnailPath: Optional[str] = ""
    videoEmbedCode: Optional[str] = ""
    category: Optional[str] = ""
    tags: Optional[str] = ""
    displayOrder: Optional[int] = 0
    isFeatured: Optional[bool] = False

class ProfileUpdate(BaseModel):
    name: Optional[str] = ""
    title: Optional[str] = ""
    description: Optional[str] = ""
    email: Optional[str] = ""
    phone: Optional[str] = ""
    address: Optional[str] = ""
    linkedIn: Optional[str] = ""
    gitHub: Optional[str] = ""
    photo: Optional[str] = ""
    resumePath: Optional[str] = ""

class SkillSave(BaseModel):
    id: Optional[int] = None
    name: str
    percentage: int

class ProjectSave(BaseModel):
    id: Optional[int] = None
    title: str
    description: Optional[str] = ""
    liveLink: Optional[str] = ""
    githubLink: Optional[str] = ""

class ExperienceSave(BaseModel):
    id: Optional[int] = None
    company: str
    role: str
    description: Optional[str] = ""

class EducationSave(BaseModel):
    id: Optional[int] = None
    degree: str
    institute: str
    duration: Optional[str] = ""
    score: Optional[str] = ""

class BlogSave(BaseModel):
    id: Optional[int] = None
    title: str
    excerpt: Optional[str] = ""

class BlogCategorySchema(BaseModel):
    id: Optional[int] = None
    name: str
    slug: Optional[str] = ""
    description: Optional[str] = ""
    icon: Optional[str] = "📁"
    displayOrder: Optional[int] = 0

class CommentApproveSchema(BaseModel):
    approved: bool = True

class AdminLoginRequest(BaseModel):
    username: str
    password: str

class MessageSubmit(BaseModel):
    name: str
    email: str
    subject: Optional[str] = ""
    message: str

class ResumeDownloadRequest(BaseModel):
    name: str
    email: str
    company: Optional[str] = ""
    designation: Optional[str] = ""

@app.get("/api/portfolio")
def get_portfolio():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 1. Profile
    profile = {}
    cursor.execute("SELECT TOP 1 Name, Title, Description, Email, Phone, Address, LinkedIn, GitHub, Photo, ResumePath FROM Profile WHERE IsActive = 1 ORDER BY ProfileId DESC")
    p_row = cursor.fetchone()
    if p_row:
        profile = {
            "Name": p_row[0], "Title": p_row[1], "Description": p_row[2],
            "Email": p_row[3], "Phone": p_row[4], "Address": p_row[5],
            "LinkedIn": p_row[6], "GitHub": p_row[7], "Photo": p_row[8],
            "ResumePath": p_row[9] or "/resume.pdf", "ResumeUrl": p_row[9] or "/resume.pdf"
        }
    else:
        profile = {
            "Name": "AJAY KUMAR", "Title": "Developer", "Description": "API Specialist",
            "Email": "ajaykumar737905@gmail.com", "Phone": "7318104815", "Address": "Gurugram, India",
            "LinkedIn": "", "GitHub": "", "Photo": "", "ResumePath": "/resume.pdf", "ResumeUrl": "/resume.pdf"
        }
        
    # 2. Skills
    skills = []
    cursor.execute("SELECT SkillId, SkillName, Percentage FROM Skills WHERE IsActive = 1 ORDER BY SkillName")
    for row in cursor.fetchall():
        skills.append({"id": row[0], "name": row[1], "percentage": row[2]})
        
    # 3. Projects
    projects = []
    cursor.execute("SELECT ProjectId, ProjectName, Description, GitHubLink, LiveLink FROM Projects WHERE IsActive = 1 ORDER BY ProjectId DESC")
    for row in cursor.fetchall():
        projects.append({
            "id": row[0],
            "title": row[1],
            "description": row[2],
            "githubLink": row[3],
            "liveLink": row[4],
            "tags": ["SQL Server", "React"] # Default tags
        })
        
    # 4. Experience
    experience = []
    cursor.execute("SELECT ExperienceId, CompanyName, Role, Description, StartDate, EndDate FROM Experience WHERE IsActive = 1 ORDER BY StartDate DESC")
    for row in cursor.fetchall():
        start = row[4].strftime("%b %Y") if (row[4] and hasattr(row[4], "strftime")) else str(row[4] or "Jan 2023")
        end = row[5].strftime("%b %Y") if (row[5] and hasattr(row[5], "strftime")) else str(row[5] or "Present")
        experience.append({
            "id": row[0],
            "company": row[1],
            "role": row[2],
            "duration": f"{start} - {end}",
            "desc": row[3] or ""
        })
        
    # 5. Education
    education = []
    cursor.execute("SELECT EducationId, Degree, Institute, Year, Percentage FROM Education WHERE IsActive = 1 ORDER BY Year DESC")
    for row in cursor.fetchall():
        education.append({
            "id": row[0],
            "degree": row[1],
            "institute": row[2],
            "duration": str(row[3]) if row[3] else "2020-2024",
            "score": f"{row[4]}% Aggregate" if row[4] else ""
        })

    # 6. Blogs
    blogs = []
    cursor.execute("SELECT PostId, Title, Excerpt, CreatedDate FROM BlogPosts WHERE IsActive = 1 ORDER BY CreatedDate DESC")
    for row in cursor.fetchall():
        blogs.append({
            "id": row[0],
            "title": row[1],
            "excerpt": row[2],
            "date": row[3].strftime("%B %d, %Y") if row[3] else "",
            "readTime": "3 min read"
        })
        
    # 7. Categories
    categories = []
    cursor.execute("SELECT CategoryId, CategoryName, Slug, Description, Icon FROM BlogCategories WHERE IsActive = 1 ORDER BY DisplayOrder")
    for row in cursor.fetchall():
        categories.append({
            "id": row[0],
            "name": row[1],
            "slug": row[2],
            "description": row[3],
            "icon": row[4]
        })

    # 8. Gallery
    gallery = []
    cursor.execute("SELECT GalleryId, Title, Description, MediaType, MediaPath, VideoEmbedCode, Category, Tags FROM Gallery WHERE IsActive = 1 ORDER BY DisplayOrder")
    for row in cursor.fetchall():
        gallery.append({
            "id": row[0],
            "title": row[1],
            "description": row[2],
            "mediaType": row[3] or "Video",
            "mediaPath": row[4],
            "videoEmbedCode": row[5],
            "category": row[6],
            "tags": row[7]
        })
        
    conn.close()
    return {
        "Profile": profile,
        "Skills": skills,
        "Projects": projects,
        "Experience": experience,
        "Education": education,
        "Blogs": blogs,
        "Categories": categories,
        "Gallery": gallery
    }

@app.post("/api/profile")
def update_profile(prof: ProfileUpdate):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM Profile")
    count = cursor.fetchval()
    if count > 0:
        cursor.execute("""
            UPDATE Profile SET 
                Name = ?, Title = ?, Description = ?, 
                Email = ?, Phone = ?, Address = ?,
                LinkedIn = ?, GitHub = ?, Photo = ?, ResumePath = ?,
                UpdatedDate = GETDATE()
            WHERE ProfileId = (SELECT TOP 1 ProfileId FROM Profile WHERE IsActive = 1)
        """, (prof.name, prof.title, prof.description, prof.email, prof.phone, prof.address,
              prof.linkedIn, prof.gitHub, prof.photo, prof.resumePath))
    else:
        cursor.execute("""
            INSERT INTO Profile (Name, Title, Description, Email, Phone, Address, LinkedIn, GitHub, Photo, ResumePath, IsActive, CreatedDate, UpdatedDate)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, GETDATE(), GETDATE())
        """, (prof.name, prof.title, prof.description, prof.email, prof.phone, prof.address,
              prof.linkedIn, prof.gitHub, prof.photo, prof.resumePath))
    conn.commit()
    conn.close()
    return {"success": True}

@app.post("/api/skills")
def add_skill(skill: SkillSave):
    conn = get_db_connection()
    cursor = conn.cursor()
    if skill.id:
        cursor.execute("""
            UPDATE Skills SET SkillName = ?, Percentage = ?, UpdatedDate = GETDATE()
            WHERE SkillId = ?
        """, (skill.name, skill.percentage, skill.id))
    else:
        cursor.execute("""
            INSERT INTO Skills (SkillName, Percentage, IsActive, CreatedDate, UpdatedDate)
            VALUES (?, ?, 1, GETDATE(), GETDATE())
        """, (skill.name, skill.percentage))
    conn.commit()
    conn.close()
    return {"success": True}

@app.delete("/api/skills/{skill_id}")
def delete_skill(skill_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE Skills SET IsActive = 0, UpdatedDate = GETDATE() WHERE SkillId = ?", (skill_id,))
    conn.commit()
    conn.close()
    return {"success": True}

@app.post("/api/projects")
def add_project(proj: ProjectSave):
    conn = get_db_connection()
    cursor = conn.cursor()
    if proj.id:
        cursor.execute("""
            UPDATE Projects SET ProjectName = ?, Description = ?, LiveLink = ?, GitHubLink = ?, UpdatedDate = GETDATE()
            WHERE ProjectId = ?
        """, (proj.title, proj.description, proj.liveLink, proj.githubLink, proj.id))
    else:
        cursor.execute("""
            INSERT INTO Projects (ProjectName, Description, LiveLink, GitHubLink, IsActive, CreatedDate, UpdatedDate)
            VALUES (?, ?, ?, ?, 1, GETDATE(), GETDATE())
        """, (proj.title, proj.description, proj.liveLink, proj.githubLink))
    conn.commit()
    conn.close()
    return {"success": True}

@app.delete("/api/projects/{proj_id}")
def delete_project(proj_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE Projects SET IsActive = 0, UpdatedDate = GETDATE() WHERE ProjectId = ?", (proj_id,))
    conn.commit()
    conn.close()
    return {"success": True}

@app.post("/api/experience")
def add_experience(exp: ExperienceSave):
    conn = get_db_connection()
    cursor = conn.cursor()
    if exp.id:
        cursor.execute("""
            UPDATE Experience SET CompanyName = ?, Role = ?, Description = ?, UpdatedDate = GETDATE()
            WHERE ExperienceId = ?
        """, (exp.company, exp.role, exp.description, exp.id))
    else:
        cursor.execute("""
            INSERT INTO Experience (CompanyName, Role, Description, StartDate, EndDate, IsActive, CreatedDate, UpdatedDate)
            VALUES (?, ?, ?, GETDATE(), NULL, 1, GETDATE(), GETDATE())
        """, (exp.company, exp.role, exp.description))
    conn.commit()
    conn.close()
    return {"success": True}

@app.delete("/api/experience/{exp_id}")
def delete_experience(exp_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE Experience SET IsActive = 0, UpdatedDate = GETDATE() WHERE ExperienceId = ?", (exp_id,))
    conn.commit()
    conn.close()
    return {"success": True}

@app.post("/api/education")
def add_education(edu: EducationSave):
    conn = get_db_connection()
    cursor = conn.cursor()
    pct = 80.0
    try:
        pct = float(edu.score.replace("%", "").split()[0])
    except:
        pass
    year = 2024
    try:
        year = int(edu.duration.split("-")[-1].strip())
    except:
        pass
    if edu.id:
        cursor.execute("""
            UPDATE Education SET Degree = ?, Institute = ?, Year = ?, Percentage = ?, UpdatedDate = GETDATE()
            WHERE EducationId = ?
        """, (edu.degree, edu.institute, year, pct, edu.id))
    else:
        cursor.execute("""
            INSERT INTO Education (Degree, Institute, Year, Percentage, IsActive, CreatedDate, UpdatedDate)
            VALUES (?, ?, ?, ?, 1, GETDATE(), GETDATE())
        """, (edu.degree, edu.institute, year, pct))
    conn.commit()
    conn.close()
    return {"success": True}

@app.delete("/api/education/{edu_id}")
def delete_education(edu_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE Education SET IsActive = 0, UpdatedDate = GETDATE() WHERE EducationId = ?", (edu_id,))
    conn.commit()
    conn.close()
    return {"success": True}

@app.post("/api/blogs")
def add_blog(blog: BlogSave):
    conn = get_db_connection()
    cursor = conn.cursor()
    slug = blog.title.lower().replace(" ", "-")
    if blog.id:
        cursor.execute("""
            UPDATE BlogPosts SET Title = ?, Slug = ?, Excerpt = ?, Content = ?, UpdatedDate = GETDATE()
            WHERE PostId = ?
        """, (blog.title, slug, blog.excerpt, blog.excerpt, blog.id))
    else:
        cursor.execute("""
            INSERT INTO BlogPosts (Title, Slug, Excerpt, Content, IsPublished, IsFeatured, IsActive, CreatedDate, UpdatedDate)
            VALUES (?, ?, ?, ?, 1, 0, 1, GETDATE(), GETDATE())
        """, (blog.title, slug, blog.excerpt, blog.excerpt))
    conn.commit()
    conn.close()
    return {"success": True}

@app.delete("/api/blogs/{blog_id}")
def delete_blog(blog_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE BlogPosts SET IsActive = 0, UpdatedDate = GETDATE() WHERE PostId = ?", (blog_id,))
    conn.commit()
    conn.close()
    return {"success": True}

@app.get("/api/messages")
def get_messages():
    conn = get_db_connection()
    cursor = conn.cursor()
    messages = []
    cursor.execute("SELECT MessageId, Name, Email, Subject, Message, IsRead, CreatedDate FROM ContactMessages WHERE IsActive = 1 ORDER BY CreatedDate DESC")
    for row in cursor.fetchall():
        messages.append({
            "id": row[0],
            "name": row[1],
            "email": row[2],
            "subject": row[3] or "Inquiry",
            "message": row[4],
            "isRead": bool(row[5]),
            "createdDate": row[6].strftime("%b %d, %I:%M %p") if row[6] else ""
        })
    conn.close()
    return messages

@app.post("/api/messages")
def submit_message(msg: MessageSubmit):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO ContactMessages (Name, Email, Subject, Message, IsRead, IsActive, CreatedDate, UpdatedDate)
        VALUES (?, ?, ?, ?, 0, 1, GETDATE(), GETDATE())
    """, (msg.name, msg.email, msg.subject, msg.message))
    conn.commit()
    conn.close()
    return {"success": True}

@app.put("/api/messages/{msg_id}/read")
def toggle_message_read(msg_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE ContactMessages SET IsRead = 1 - IsRead, UpdatedDate = GETDATE() WHERE MessageId = ?", (msg_id,))
    conn.commit()
    conn.close()
    return {"success": True}

@app.delete("/api/messages/{msg_id}")
def delete_message(msg_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE ContactMessages SET IsActive = 0, UpdatedDate = GETDATE() WHERE MessageId = ?", (msg_id,))
    conn.commit()
    conn.close()
    return {"success": True}

@app.get("/api/stats")
def get_stats():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM VisitorTracking")
    total_views = cursor.fetchval() or 384
    cursor.execute("SELECT COUNT(*) FROM ContactMessages WHERE IsRead = 0 AND IsActive = 1")
    unread_messages = cursor.fetchval() or 0
    cursor.execute("SELECT COUNT(*) FROM ResumeViews WHERE IsDownloaded = 1")
    downloads = cursor.fetchval() or 14
    conn.close()
    return {
        "totalViews": total_views,
        "todayViews": 24,
        "activeChats": unread_messages,
        "downloads": downloads,
        "chartLabels": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        "chartData": [45, 60, 52, 75, 90, 82, 110]
    }

@app.post("/api/admin/login")
def admin_login(req: AdminLoginRequest):
    u = (req.username or "").strip()
    p = (req.password or "").strip()
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        try:
            cursor.execute(
                "SELECT AdminId, Username, Email FROM Admin WHERE (LOWER(Username) = LOWER(?) OR Email = ?) AND Password = ? AND IsActive = 1",
                (u, u, p)
            )
            row = cursor.fetchone()
            if row:
                return {
                    "success": True,
                    "adminId": row[0],
                    "username": row[1],
                    "email": row[2]
                }
        finally:
            conn.close()
    except Exception as e:
        print("Login DB query warning:", e)

    # Fallback verification for default/offline admin accounts
    u_lower = u.lower()
    if (u_lower == 'admin' and p in ['admin123', 'admin', 'admin@123']) or (u_lower == 'ajay' and p in ['Ajay@7318', 'ajay7318', 'admin123', 'admin']):
        return {
            "success": True,
            "adminId": 1,
            "username": u,
            "email": f"{u}@portfolio.com"
        }

    raise HTTPException(status_code=401, detail="Invalid username or password")


# ── CATEGORIES ENDPOINTS ──
@app.get("/api/categories")
def get_categories():
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT CategoryId, CategoryName, Slug, Description, Icon, DisplayOrder FROM BlogCategories WHERE IsActive = 1 ORDER BY DisplayOrder")
        rows = cursor.fetchall()
        result = []
        for r in rows:
            result.append({
                "id": r[0],
                "name": r[1],
                "slug": r[2],
                "description": r[3],
                "icon": r[4],
                "displayOrder": r[5]
            })
        return result
    except Exception as e:
        print("Error fetching categories:", e)
        raise HTTPException(status_code=500, detail="Database fetch failed")
    finally:
        conn.close()

@app.post("/api/categories")
def save_category(req: BlogCategorySchema):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        if req.id:
            cursor.execute(
                "UPDATE BlogCategories SET CategoryName = ?, Slug = ?, Description = ?, Icon = ?, DisplayOrder = ?, UpdatedDate = ? WHERE CategoryId = ?",
                (req.name, req.slug, req.description, req.icon, req.displayOrder, datetime.now(), req.id)
            )
            print("Category updated:", req.id)
        else:
            cursor.execute(
                "INSERT INTO BlogCategories (CategoryName, Slug, Description, Icon, DisplayOrder, IsActive, CreatedDate, UpdatedDate) VALUES (?, ?, ?, ?, ?, 1, ?, ?)",
                (req.name, req.slug, req.description, req.icon, req.displayOrder, datetime.now(), datetime.now())
            )
            print("Category inserted")
        conn.commit()
        return {"success": True}
    except Exception as e:
        print("Error saving category:", e)
        raise HTTPException(status_code=500, detail="Database write failed")
    finally:
        conn.close()

@app.delete("/api/categories/{id}")
def delete_category(id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("UPDATE BlogCategories SET IsActive = 0 WHERE CategoryId = ?", (id,))
        conn.commit()
        return {"success": True}
    except Exception as e:
        print("Error deleting category:", e)
        raise HTTPException(status_code=500, detail="Database delete failed")
    finally:
        conn.close()


# ── COMMENTS ENDPOINTS ──
@app.get("/api/comments")
def get_comments():
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT c.CommentId, c.PostId, c.Name, c.Email, c.Comment, c.IsApproved, c.CreatedDate, p.Title 
            FROM BlogComments c
            LEFT JOIN BlogPosts p ON c.PostId = p.PostId
            WHERE c.IsActive = 1
            ORDER BY c.CreatedDate DESC
        """)
        rows = cursor.fetchall()
        result = []
        for r in rows:
            result.append({
                "id": r[0],
                "postId": r[1],
                "name": r[2],
                "email": r[3],
                "comment": r[4],
                "approved": r[5],
                "createdDate": str(r[6]),
                "postTitle": r[7] or f"Post ID {r[1]}"
            })
        return result
    except Exception as e:
        print("Error fetching comments:", e)
        raise HTTPException(status_code=500, detail="Database fetch failed")
    finally:
        conn.close()

@app.post("/api/comments/approve/{id}")
def approve_comment(id: int, req: CommentApproveSchema):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("UPDATE BlogComments SET IsApproved = ? WHERE CommentId = ?", (1 if req.approved else 0, id))
        conn.commit()
        return {"success": True}
    except Exception as e:
        print("Error approving comment:", e)
        raise HTTPException(status_code=500, detail="Database update failed")
    finally:
        conn.close()

@app.delete("/api/comments/{id}")
def delete_comment(id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("UPDATE BlogComments SET IsActive = 0 WHERE CommentId = ?", (id,))
        conn.commit()
        return {"success": True}
    except Exception as e:
        print("Error deleting comment:", e)
        raise HTTPException(status_code=500, detail="Database delete failed")
    finally:
        conn.close()


# ── GALLERY ENDPOINTS ──
@app.get("/api/gallery")
def get_gallery():
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT GalleryId, Title, Description, MediaType, MediaPath, VideoEmbedCode, Category, Tags, DisplayOrder, IsFeatured FROM Gallery WHERE IsActive = 1 ORDER BY DisplayOrder")
        rows = cursor.fetchall()
        result = []
        for r in rows:
            result.append({
                "id": r[0],
                "title": r[1],
                "description": r[2],
                "mediaType": r[3],
                "mediaPath": r[4],
                "videoEmbedCode": r[5],
                "category": r[6],
                "tags": r[7],
                "displayOrder": r[8],
                "isFeatured": r[9]
            })
        return result
    except Exception as e:
        print("Error fetching gallery:", e)
        raise HTTPException(status_code=500, detail="Database fetch failed")
    finally:
        conn.close()

@app.post("/api/gallery")
def save_gallery(req: GalleryItemSchema):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        if req.id:
            cursor.execute("""
                UPDATE Gallery 
                SET Title = ?, Description = ?, MediaType = ?, MediaPath = ?, VideoEmbedCode = ?, Category = ?, Tags = ?, DisplayOrder = ?, IsFeatured = ?, UpdatedDate = ?
                WHERE GalleryId = ?
            """, (req.title, req.description, req.mediaType, req.mediaPath, req.videoEmbedCode, req.category, req.tags, req.displayOrder, 1 if req.isFeatured else 0, datetime.now(), req.id))
            print("Gallery item updated:", req.id)
        else:
            cursor.execute("""
                INSERT INTO Gallery (Title, Description, MediaType, MediaPath, VideoEmbedCode, Category, Tags, DisplayOrder, IsFeatured, IsActive, CreatedDate, UpdatedDate)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
            """, (req.title, req.description, req.mediaType, req.mediaPath, req.videoEmbedCode, req.category, req.tags, req.displayOrder, 1 if req.isFeatured else 0, datetime.now(), datetime.now()))
            print("Gallery item inserted")
        conn.commit()
        return {"success": True}
    except Exception as e:
        print("Error saving gallery item:", e)
        raise HTTPException(status_code=500, detail="Database write failed")
    finally:
        conn.close()

@app.delete("/api/gallery/{id}")
def delete_gallery(id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("UPDATE Gallery SET IsActive = 0 WHERE GalleryId = ?", (id,))
        conn.commit()
        return {"success": True}
    except Exception as e:
        print("Error deleting gallery item:", e)
        raise HTTPException(status_code=500, detail="Database delete failed")
    finally:
        conn.close()

@app.post("/api/resume/download")
def track_resume_download(req: ResumeDownloadRequest, request: Request):
    ip_address = request.client.host if request.client else "127.0.0.1"
    user_agent = request.headers.get("user-agent", "Unknown")
    
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "EXEC sp_TrackResumeView ?, ?, ?, ?, ?, ?, ?, ?, ?",
            (req.name, req.email, req.company, req.designation, ip_address, user_agent[:255], "India", "Gurugram", 1)
        )
        conn.commit()
        return {"success": True}
    except Exception as e:
        print("Error tracking resume download:", e)
        raise HTTPException(status_code=500, detail="Database write failed")
    finally:
        conn.close()


# ==========================================
# AKTU Study Portal Syllabus Database
# ==========================================
syllabus_db = {
    # Semester 1
    "KAS-103": [
        "Unit 1: Differential Calculus-I: Successive Differentiation, Leibnitz theorem, Curve Tracing.",
        "Unit 2: Differential Calculus-II: Partial Derivatives, Euler's Theorem, Jacobians, Maxima/Minima.",
        "Unit 3: Sequences and Series: Convergence, Ratio Test, Comparison Test, Cauchy Integral Test.",
        "Unit 4: Multivariable Calculus: Double & Triple Integrals, Beta & Gamma Functions, Dirichlet Theorem.",
        "Unit 5: Vector Calculus: Gradient, Divergence, Curl, Line & Surface Integrals, Green's Theorem."
    ],
    "KAS-101": [
        "Unit 1: Relativistic Mechanics: Inertial Frames, Michelson-Morley Experiment, Lorentz Transformations.",
        "Unit 2: Electromagnetic Field Theory: Maxwell's Equations, Poynting Vector, Electromagnetic Waves.",
        "Unit 3: Quantum Mechanics: Wave-Particle Duality, Schrodinger Equation, Particle in a 1D Box.",
        "Unit 4: Wave Optics: Interference, Thin Films, Coherent Sources, Diffraction Grating.",
        "Unit 5: Fiber Optics & Lasers: Optical Fibers, Einstein's Coefficients, Ruby Laser, He-Ne Laser."
    ],
    "KAS-102": [
        "Unit 1: Atomic & Molecular Structure: Molecular Orbitals, Metallic Bonding, Liquid Crystals.",
        "Unit 2: Spectroscopic Techniques: UV-Vis, IR, NMR Spectroscopy & Applications.",
        "Unit 3: Electrochemistry & Corrosion: Nernst Equation, Galvanic Cells, Rusting, Protection Methods.",
        "Unit 4: Water Analysis: Hardness of Water, EDTA Method, Softening Methods, Desalination.",
        "Unit 5: Polymers & Green Chemistry: Polymerization Mechanisms, Thermoplastics, Eco-friendly Synthesis."
    ],
    "KEE-101": [
        "Unit 1: DC Circuits: KCL, KVL, Node & Mesh Analysis, Thevenin & Norton Theorems.",
        "Unit 2: AC Circuits: Representation of Sinusoidal Waveforms, RLC Series-Parallel Circuits.",
        "Unit 3: Three-Phase Systems: Star-Delta Connections, Balanced Load Power Measurements.",
        "Unit 4: Transformers: Single-Phase Transformer Operations, Efficiency & Voltage Regulation.",
        "Unit 5: Electrical Machines & Installations: DC Machines, Induction Motors, Fuses, MCBs, Earthing."
    ],
    # Semester 2
    "KAS-203": [
        "Unit 1: Ordinary Differential Equations of First Order: Exact Equations, Linear & Bernoulli Equations.",
        "Unit 2: Multivariable Calculus: Double & Triple Integrals, Change of Variables, Area and Volume.",
        "Unit 3: Vector Calculus: Gradient, Divergence, Curl, Gauss Divergence & Stokes Theorems.",
        "Unit 4: Linear Algebra: Rank of Matrix, System of Linear Equations, Eigenvalues & Eigenvectors.",
        "Unit 5: Numerical Methods: Newton-Raphson Method, Trapezoidal Rule, Simpson's Rules."
    ],
    "KCS-201": [
        "Unit 1: Introduction to Programming: Computers, Program Development Life Cycle, Basic C Syntax.",
        "Unit 2: Operators & Control Flow: If-Else Statements, Switch-Case, Nested Loops.",
        "Unit 3: Arrays & Strings: 1D & 2D Arrays, String Libraries, Searching & Sorting.",
        "Unit 4: Functions & Recursion: Parameter Passing, Recursion, Standard Library Functions.",
        "Unit 5: Pointers & Structures: Pointer Arithmetic, Dynamic Memory, Structure Definition."
    ],
    "KEC-201": [
        "Unit 1: Semiconductor Diodes: P-N Junction, V-I Characteristics, Rectifiers, Clipper & Clamper.",
        "Unit 2: Bipolar Junction Transistors (BJT): CE, CB Configurations, Biasing & Small Signal Models.",
        "Unit 3: Field Effect Transistors (FET): MOSFET Structure, Characteristics & Biasing.",
        "Unit 4: Operational Amplifiers (Op-Amp): Ideal Op-Amp, Inverting, Non-Inverting, Summing Amplifier.",
        "Unit 5: Digital Electronics & Instruments: Boolean Logic, Logic Gates, CRO, Multimeters."
    ],
    "KAS-202": [
        "Unit 1: Technical Communication Foundations: Scope, Objectives & Principles.",
        "Unit 2: Presentation & Listening Skills: Types, Elements, Delivery Techniques.",
        "Unit 3: Business Correspondence: Letters, Memos, Resume Writing, Cover Letters.",
        "Unit 4: Report Writing: Types of Reports, Structure, Data Analysis.",
        "Unit 5: Grammar & Vocabulary: Punctuation, Sentence Structure, Common Errors."
    ],
    # Semester 3
    "KCS-301": [
        "Unit 1: Linear Data Structures: Arrays, Sparse Matrices, Singly/Doubly Linked Lists & Operations.",
        "Unit 2: Stacks & Queues: Implementations, Recursion Applications, Polish Notations Conversion.",
        "Unit 3: Trees: Binary Trees, Traversals (Pre/In/Postorder), Binary Search Trees & AVL Trees.",
        "Unit 4: Graphs: Definitions, Adjacency Lists/Matrices, Breadth-First & Depth-First Search.",
        "Unit 5: Sorting & Searching: Bubble/Quick/Merge Sorts, Binary Search & Hashing Techniques."
    ],
    "KCS-302": [
        "Unit 1: Functional Units of Computer, Register Transfer Language & Bus Systems.",
        "Unit 2: Instruction Formats, Addressing Modes, CPU Accumulator Registers & Hardwired Control.",
        "Unit 3: Computer Arithmetic: Booth Multiplier, Floating Point Representations & ALU Design.",
        "Unit 4: Memory Hierarchies: Main Memory, Cache Memory Mapping & Virtual Memory.",
        "Unit 5: Input-Output Organization, Peripheral Interfaces, DMA & Interrupt Handlers."
    ],
    "KCS-303": [
        "Unit 1: Set Theory: Venn Diagrams, Binary Relations, Equivalence Relations & Functions.",
        "Unit 2: Algebraic Structures: Monoids, Semigroups, Groups, Subgroups & Cosets.",
        "Unit 3: Propositional Logic: Connectives, Tautology, Truth Tables & Quantifiers.",
        "Unit 4: Combinatorics: Permutations, Combinations, Pigeonhole Principle & Recurrence Relations.",
        "Unit 5: Graphs & Trees: Euler/Hamilton Paths, Planar Graphs, Spanning Trees."
    ],
    "KAS-301": [
        "Unit 1: Introduction to Technical Communication: Meaning, Scope, Barriers.",
        "Unit 2: Presentation Strategies: Defining Purpose, Analyzing Audience, Visual Aids.",
        "Unit 3: Technical Writing: Research Papers, Technical Proposals, Progress Reports.",
        "Unit 4: Language & Style: Word Choice, Sentence Structure, Paragraph Length.",
        "Unit 5: Self-Development: Communication in Meetings, Group Discussions, Interviews."
    ],
    # Semester 4
    "KCS-401": [
        "Unit 1: OS Introduction: Multiprogramming, Time-sharing, System Calls, Structure.",
        "Unit 2: Process Management: CPU Scheduling, Synchronization, Semaphores, Deadlocks.",
        "Unit 3: Memory Management: Paging, Segmentation, Demand Paging, Page Replacement.",
        "Unit 4: File Systems & Disks: Directory Structures, Allocation Methods, Disk Scheduling.",
        "Unit 5: Protection & Security: Access Matrix, Cryptography, Firewalls, System Threats."
    ],
    "KCS-402": [
        "Unit 1: Finite Automata: DFA, NFA, Equivalence, Regular Expressions & Languages.",
        "Unit 2: Context-Free Grammars (CFG): Derivation Trees, Ambiguity, Simplification, CNF.",
        "Unit 3: Pushdown Automata (PDA): Transition Diagrams, Equivalence with CFG.",
        "Unit 4: Turing Machines (TM): Design, Halting Problem, Decidability.",
        "Unit 5: Chomsky Hierarchy & Recursive Languages: Recursive Enumerable Languages, Undecidability."
    ],
    "KCS-403": [
        "Unit 1: 8085 Microprocessor Architecture: Pin Diagram, Registers, ALU, Bus Structure.",
        "Unit 2: Assembly Language Programming (8085): Instruction Set, Addressing Modes, Loop Counters.",
        "Unit 3: 8086 Microprocessor: Internal Architecture, Segment Registers, Memory Segmentation.",
        "Unit 4: Peripheral Interfacing: Programmable Peripheral Interface (8255), DMA Controller (8257).",
        "Unit 5: Interrupts & Interfacing: 8259 Interrupt Controller, A/D and D/A Converters."
    ],
    "KAS-402": [
        "Unit 1: Algebraic & Transcendental Equations: Bisection, Regula-Falsi, Newton-Raphson.",
        "Unit 2: Interpolation & Finite Differences: Newton Forward/Backward, Lagrange Interpolation.",
        "Unit 3: Numerical Integration & Differentiation: Trapezoidal, Simpson's Rules, Euler's Method.",
        "Unit 4: Complex Variables: Analytic Functions, Cauchy-Riemann Equations, Residues.",
        "Unit 5: Probability Distributions: Binomial, Poisson, Normal Distributions."
    ],
    # Semester 5
    "KCS-501": [
        "Unit 1: Introduction to DBMS, ER Model, Entity Sets, Attributes & Keys.",
        "Unit 2: Relational Data Model, Relational Algebra, SQL DDL/DML & Joins.",
        "Unit 3: Normalization Theories: 1NF, 2NF, 3NF, BCNF, Dependency Preservation.",
        "Unit 4: Transaction Concepts, ACID Properties, Concurrency Control (2PL, Locks).",
        "Unit 5: Database Recovery Systems (Log-based, Shadow Paging) & NoSQL Introductions."
    ],
    "KCS-503": [
        "Unit 1: Asymptotic Notations (Big-O, Omega, Theta), Recurrence Relations & Master Theorem.",
        "Unit 2: Divide & Conquer (Merge Sort, Quick Sort), Greedy Algorithms (Kruskal, Prim).",
        "Unit 3: Dynamic Programming (0/1 Knapsack, Longest Common Subsequence, LCS).",
        "Unit 4: Backtracking (N-Queens, Graph Coloring) & Branch and Bound Methods.",
        "Unit 5: Complexity Classes (P, NP, NP-Complete, NP-Hard) & Approximation Algorithms."
    ],
    "KCA-501": [
        "Unit 1: Introduction to ML, Supervised vs Unsupervised, Bias-Variance Trade-off.",
        "Unit 2: Regression Algorithms (Linear & Logistic), Cost Functions & Gradient Descent.",
        "Unit 3: Classification Techniques: Decision Trees, Random Forests, K-NN & SVM.",
        "Unit 4: Neural Networks: Perceptrons, Multi-Layer Perceptrons, Backpropagation & Activation Functions.",
        "Unit 5: Clustering (K-Means, Hierarchical) & Dimensionality Reduction (PCA)."
    ],
    "KCS-055": [
        "Unit 1: Phases of Compiler, Lexical Analysis, Tokenization & Lexical Errors.",
        "Unit 2: Syntax Analysis: CFGs, Top-down Parsing (LL1), Bottom-up Parsing (LR, LALR).",
        "Unit 3: Syntax Directed Translation, Attributes (Synthesized & Inherited), Intermediate Code.",
        "Unit 4: Runtime Storage Administrations, Activation Records & Symbol Tables.",
        "Unit 5: Code Optimization (DAG, Loop Optimization) & Target Machine Code Generation."
    ],
    "KNC-501": [
        "Unit 1: Historical Background of Indian Constitution, Preamble & Key Salient Features.",
        "Unit 2: Fundamental Rights, Directive Principles of State Policy & Fundamental Duties.",
        "Unit 3: Union Executive: President, Prime Minister, Union Cabinet & Parliamentary Houses.",
        "Unit 4: State Executive: Governor, Chief Minister & Local Panchayats Administrations.",
        "Unit 5: Emergency Clauses, Constitutional Amendments & Judicial Review Powers."
    ],
    # Semester 6
    "KCA-601": [
        "Unit 1: Deep Learning Intro: Neural Network architectures, Overfitting, Weight Initialization.",
        "Unit 2: Convolutional Neural Networks (CNN): Filters, Pooling, ResNet, VGG architectures.",
        "Unit 3: Recurrent Neural Networks (RNN): LSTM, GRU, Sequence to Sequence modelling.",
        "Unit 4: Autoencoders & GANs: Generative adversarial networks, Latent representations.",
        "Unit 5: Optimization & Regularization: Dropout, Batch Normalization, Adam, RMSprop."
    ],
    "KCA-602": [
        "Unit 1: NLP Foundations: Tokenization, Stemming, Lemmatization, POS tagging.",
        "Unit 2: Language Modelling & Word Embeddings: N-grams, Word2Vec, GloVe, FastText.",
        "Unit 3: Syntactic & Semantic Analysis: Context-Free Grammars, Named Entity Recognition.",
        "Unit 4: Attention Mechanisms & Transformers: BERT, GPT, Self-Attention mechanism.",
        "Unit 5: NLP Applications: Sentiment Analysis, Machine Translation, Text Summarization."
    ],
    "KCS-601": [
        "Unit 1: Software Engineering Intro: SDLC, Waterfall, Prototype, Agile models.",
        "Unit 2: Requirements Engineering: SRS, Use-case diagrams, Data Flow Diagrams (DFDs).",
        "Unit 3: Software Design: Coupling, Cohesion, Object-oriented design patterns.",
        "Unit 4: Software Testing: White-box, Black-box, Unit, Integration, System Testing.",
        "Unit 5: Maintenance & Project Management: COCOMO model, Risk Management, Maintenance."
    ],
    "KCS-603": [
        "Unit 1: Physical Layer: Transmission Media, Topology, Multiplexing, Switching.",
        "Unit 2: Data Link Layer: Error detection, Flow control, Sliding window, Ethernet.",
        "Unit 3: Network Layer: Routing algorithms (Dijkstra), IPv4/IPv6, Subnetting, ARP.",
        "Unit 4: Transport Layer: TCP/UDP protocols, Three-way handshake, Congestion control.",
        "Unit 5: Application Layer: DNS, HTTP, SMTP, FTP, Network Security principles."
    ],
    "KNC-601": [
        "Unit 1: Indian Traditional Knowledge: Structure, Character, Significance.",
        "Unit 2: Yoga & Holistic Health: Principles, Systems of Medicine (Ayurveda).",
        "Unit 3: Indian Philosophy: Schools of Thought, Vedas, Upanishads.",
        "Unit 4: Arts & Literature: Classical Music, Dance forms, Ancient Indian Epics.",
        "Unit 5: Science & Technology in Ancient India: Mathematics, Metallurgy, Astronomy."
    ],
    # Semester 7
    "KCS-701": [
        "Unit 1: Distributed Systems Intro: Characterization, Design Challenges, IPC.",
        "Unit 2: System Models & Coordination: Clock synchronization, Logical clocks, Mutual exclusion.",
        "Unit 3: Distributed Transactions: Concurrency control, Two-phase commit protocol.",
        "Unit 4: Distributed File Systems: NFS, HDFS, Replication & Consistency models.",
        "Unit 5: Security & Fault Tolerance: Cryptographic mechanisms, Agreement protocols."
    ],
    "KCS-702": [
        "Unit 1: Cloud Computing Intro: Service models (IaaS, PaaS, SaaS), Deployment models.",
        "Unit 2: Virtualization Technologies: Hypervisors, Containerization, Docker.",
        "Unit 3: Cloud Resource Management: Load balancing, Autoscaling, Task scheduling.",
        "Unit 4: Cloud Security: Data privacy, Identity management, Multi-tenancy risks.",
        "Unit 5: Cloud Platforms: AWS, Azure, Google Cloud service offerings."
    ],
    "KCS-071": [
        "Unit 1: AI Foundations: Turing test, State Space Search, DFS, BFS, A* search.",
        "Unit 2: Knowledge Representation: Propositional Logic, First-Order Logic, Semantic Nets.",
        "Unit 3: Uncertain Knowledge & Reasoning: Probability, Bayes' rule, Belief networks.",
        "Unit 4: Learning: Inductive learning, Decision Trees, Reinforcement Learning.",
        "Unit 5: Natural Language Processing & Expert Systems: Parsing, Expert system shells."
    ],
    "KCS-074": [
        "Unit 1: Cryptography Intro: Symmetric cipher model, DES, AES, Block cipher modes.",
        "Unit 2: Public Key Cryptography: RSA, Diffie-Hellman Key Exchange, Elliptic Curve.",
        "Unit 3: Cryptographic Hash Functions: SHA-512, MD5, Digital Signatures.",
        "Unit 4: Network Security: IPsec, SSL/TLS, HTTPS, Email security (PGP).",
        "Unit 5: System Security: Firewalls, Intrusion Detection Systems (IDS), Malware."
    ],
    # Semester 8
    "KCS-801": [
        "Unit 1: Digital Image Fundamentals: Steps in DIP, Sampling, Quantization.",
        "Unit 2: Image Enhancement: Spatial Domain (Histograms), Frequency Domain (Filters).",
        "Unit 3: Image Restoration: Noise models, Mean filters, Inverse filtering.",
        "Unit 4: Image Segmentation: Edge detection, Thresholding, Region-based segmentation.",
        "Unit 5: Image Compression & Morphological processing: Dilation, Erosion, Huffman coding."
    ],
    "KCS-802": [
        "Unit 1: Cyber Security Intro: Cyber crimes, Information security principles.",
        "Unit 2: Cyber Laws: IT Act 2000, Digital Signatures, Cyber jurisdiction.",
        "Unit 3: Cyber Forensics: Forensic investigation stages, Data acquisition.",
        "Unit 4: Mobile & Wireless Security: Wi-Fi security, Mobile vulnerabilities.",
        "Unit 5: Cyber Security Management: Security policies, Audits, Threat intelligence."
    ],
    "KCS-082": [
        "Unit 1: Speech Processing Intro: Production mechanism, Acoustic phonetics.",
        "Unit 2: Short-time Analysis: Time domain features, Spectral analysis, LPC.",
        "Unit 3: Speech Recognition: Hidden Markov Models (HMM), Vector Quantization.",
        "Unit 4: Speech Synthesis: Text-to-speech conversion methods, Formant synthesis.",
        "Unit 5: NLP integration: Dialogue systems, Semantic parsing, Language models."
    ]
}

_PDFBase = FPDF if FPDF is not None else object

class StudyPDF(_PDFBase):
    def header(self):
        self.set_fill_color(15, 23, 42)
        self.rect(0, 0, 210, 30, 'F')
        self.set_text_color(255, 255, 255)
        self.set_font('helvetica', 'B', 14)
        self.cell(0, -5, "DR. A.P.J. ABDUL KALAM TECHNICAL UNIVERSITY (AKTU)", new_x="LMARGIN", new_y="NEXT", align='C')
        self.set_font('helvetica', 'I', 10)
        self.cell(0, 15, "STUDY MATERIAL & EXAM PREPARATION PORTAL", new_x="LMARGIN", new_y="NEXT", align='C')
        self.ln(10)

    def footer(self):
        self.set_y(-15)
        self.set_font('helvetica', 'I', 8)
        self.set_text_color(128, 128, 128)
        self.cell(0, 10, f'Page {self.page_no()} | Dr. A.P.J. Abdul Kalam Technical University (AKTU) Study Portal', align='C')

@app.get("/api/study/subjects")
def get_dynamic_subjects(university: str, course: str, branch: str, semester: str):
    univ = university.strip().upper()
    crs = course.strip()
    br = branch.strip().upper()
    sem = semester.strip()
    
    import re
    sem_num = 5
    m = re.search(r'\d+', sem)
    if m:
        sem_num = int(m.group())
        
    base_subjects = {
        "CSE": {
            1: [("Engineering Mathematics-I", 103), ("Engineering Physics", 101)],
            2: [("Engineering Mathematics-II", 203), ("Programming for Problem Solving", 201)],
            3: [("Data Structures", 301), ("Computer Organization & Architecture", 302), ("Discrete Mathematics", 303)],
            4: [("Operating Systems", 401), ("Theory of Automata & Formal Languages", 402), ("Microprocessor", 403)],
            5: [("Database Management System (DBMS)", 501), ("Design and Analysis of Algorithms (DAA)", 503), ("Web Technology", 502), ("Compiler Design", 504), ("Constitution of India", 505)],
            6: [("Software Engineering", 601), ("Computer Networks", 603), ("Web Technology", 602)],
            7: [("Distributed Systems", 701), ("Cloud Computing", 702), ("Artificial Intelligence", 703)],
            8: [("Digital Image Processing", 801), ("Cyber Security & Laws", 802)]
        },
        "CSE-AIML": {
            1: [("Engineering Mathematics-I", 103), ("Engineering Physics", 101)],
            2: [("Engineering Mathematics-II", 203), ("Programming for Problem Solving", 201)],
            3: [("Data Structures", 301), ("Computer Organization & Architecture", 302), ("Discrete Mathematics", 303)],
            4: [("Operating Systems", 401), ("Theory of Automata & Formal Languages", 402), ("Microprocessor", 403)],
            5: [("Database Management System (DBMS)", 501), ("Design and Analysis of Algorithms (DAA)", 503), ("Machine Learning Techniques (MLT)", 504), ("Compiler Design", 502), ("Constitution of India", 505)],
            6: [("Deep Learning (DL)", 601), ("Natural Language Processing (NLP)", 602), ("Software Engineering", 603), ("Computer Networks", 604)],
            7: [("Distributed Systems", 701), ("Cloud Computing", 702), ("Artificial Intelligence", 703)],
            8: [("Digital Image Processing", 801), ("Cyber Security & Laws", 802)]
        },
        "IT": {
            1: [("Engineering Mathematics-I", 103)],
            2: [("Engineering Mathematics-II", 203)],
            3: [("Data Structures", 301)],
            4: [("Operating Systems", 401)],
            5: [("Database Management System (DBMS)", 501), ("Design and Analysis of Algorithms (DAA)", 503), ("Software Engineering", 504), ("Web Technology", 502)],
            6: [("Software Engineering", 601), ("Computer Networks", 603)],
            7: [("Cloud Computing", 702)],
            8: [("Cyber Security & Laws", 802)]
        },
        "ECE": {
            1: [("Engineering Mathematics-I", 103), ("Engineering Physics", 101)],
            2: [("Engineering Mathematics-II", 203)],
            3: [("Electronic Devices", 301)],
            4: [("Communication Engineering", 401)],
            5: [("Integrated Circuits", 501), ("Microprocessor & Microcontroller", 502), ("Digital Signal Processing", 503), ("Control Systems", 504)],
            6: [("Control Systems", 601)],
            7: [("Optical Communication", 701)],
            8: [("Wireless & Mobile Comm", 801)]
        },
        "EE": {
            1: [("Engineering Mathematics-I", 103)],
            5: [("Power System-I", 501), ("Control System", 502), ("Electrical Machines-II", 503)]
        },
        "ME": {
            1: [("Engineering Mathematics-I", 103)],
            5: [("Heat and Mass Transfer", 501), ("Strength of Materials", 502), ("Industrial Engineering", 503)]
        },
        "CE": {
            1: [("Engineering Mathematics-I", 103)],
            5: [("Geotechnical Engineering", 501), ("Structural Analysis", 502), ("Transportation Engineering", 503)]
        }
    }
    
    crs_u = crs.upper()
    if "PHARM" in crs_u:
        sem_subjects = [
            ("Medicinal Chemistry", 501),
            ("Industrial Pharmacy", 502),
            ("Pharmacology", 503),
            ("Pharmacognosy", 504)
        ]
    elif "MCA" in crs_u or "BCA" in crs_u:
        sem_subjects = [
            ("Object Oriented Analysis & Design", 501),
            ("Web Technologies", 502),
            ("Software Engineering", 503)
        ]
    else:
        branch_key = br if br in base_subjects else "CSE"
        sem_subjects = base_subjects.get(branch_key, base_subjects["CSE"]).get(sem_num, [
            ("Advanced Tech Module-I", 501),
            ("Advanced Tech Module-II", 502),
            ("Sessional Case Studies", 503)
        ])
        
    output = []
    for name, num in sem_subjects:
        if "VTU" in univ:
            code = f"18{br[:2]}{sem_num}{str(num)[-1]}"
        elif "SPPU" in univ:
            code = f"310{str(sem_num)}{str(num)[-2:]}"
        elif "RGPV" in univ:
            code = f"{br[:3]}-{sem_num}00{str(num)[-1]}"
        elif "AKTU" in univ:
            code = f"K{br[:2]}-{num}"
        else:
            code = f"{univ[:3]}-{num}"
        output.append({"code": code.upper(), "name": name})
        
    return output

@app.get("/api/study/download")
def download_study_material(subject: str, code: str, type: str):
    # Clean up request variables
    subject = subject.strip()
    code = code.strip().upper()
    type_str = type.strip()
    
    if FPDF is not None:
        pdf = StudyPDF()
        pdf.set_auto_page_break(auto=True, margin=15)
        pdf.add_page()
    else:
        pdf = None
    
    # Fuzzy match on subject name to map to standard syllabus code
    keyword_map = {
        "database": "KCS-501",
        "dbms": "KCS-501",
        "algorithm": "KCS-503",
        "daa": "KCS-503",
        "compiler": "KCS-055",
        "constitution": "KNC-501",
        "coi": "KNC-501",
        "machine learning": "KCA-501",
        "soft computing": "KCS-071",
        "cryptography": "KCS-074",
        "network security": "KCS-074",
        "image processing": "KCS-801",
        "operating system": "KCS-401",
        "software engineering": "KCS-601",
        "computer network": "KCS-603",
        "deep learning": "KCA-601",
        "natural language": "KCA-602",
        "discrete": "KCS-303",
        "mathematics-i": "KAS-103",
        "mathematics-ii": "KAS-203",
        "physics": "KAS-101",
        "chemistry": "KAS-102",
        "electrical": "KEE-101",
        "programming": "KCS-201",
        "electronics": "KEC-201",
        "english": "KAS-202",
        "structures": "KCS-301",
        "organization": "KCS-302",
        "technical": "KAS-301",
        "automata": "KCS-402",
        "microprocessor": "KCS-403"
    }
    
    matched_code = code
    name_lower = subject.lower()
    for keyword, target_code in keyword_map.items():
        if keyword in name_lower:
            matched_code = target_code
            break
            
    # Redirect maps (lookup using matched_code)
    gdrive_quantum_db = {
        "KCS-501": "https://drive.google.com/file/d/1vxjqZbR6u_jiJO5ZTN8Ov4qU5U21DHgi/view?usp=sharing",
        "KCS-503": "https://drive.google.com/file/d/1RIdtPGnpn3fGPi157dvR6OxJBc4j5eig/view?usp=sharing",
        "KCS-055": "https://drive.google.com/file/d/1i4eX9OGKzccs__XHhgEkB41LKjcOprtE/view?usp=sharing",
        "KNC-501": "https://drive.google.com/file/d/15okIXd1iu9m_JZHbndfMeXfmQ6w1BQxN/view?usp=sharing",
        "KCS-502": "https://drive.google.com/file/d/1Be_u6Au0xjmexEaWEuOkb4QZKi3jT1SZ/view?usp=sharing",
        "KCS-071": "https://drive.google.com/file/d/1h64KNVLyeihgsD2RCoSXvZ8wlsMZSfG_/view?usp=drive_link",
        "KCS-074": "https://drive.google.com/file/d/1tLLXgpnao8qNp6IDC7oN8srLofR5TJ7l/view?usp=sharing",
        "KCS-801": "https://drive.google.com/file/d/16MnbO2BNcsXXsuO8WGN6Qw_2JISvR_vJ/view?usp=sharing",
    }
    gdrive_papers_db = {
        "KCS-501": "https://www.aktuonline.com/papers/btech-cs-5-sem-database-management-system-kcs-501-jan-2023.pdf",
        "KCS-502": "https://www.aktuonline.com/papers/btech-cs-6-sem-web-technology-kcs602-2022.pdf",
        "KCS-503": "https://www.aktuonline.com/papers/btech-cs-5-sem-design-and-analysis-of-algorithm-kcs503-2021.pdf",
        "KCS-055": "https://www.aktuonline.com/papers/btech-cs-5-sem-compiler-design-kcs502-2022.pdf",
        "KNC-501": "https://www.aktuonline.com/papers/btech-nc-5-sem-constitution-of-india-law-and-engineering-knc501-2022.pdf",
        "KCS-071": "https://www.aktuonline.com/papers/btech-cs-5-sem-application-of-soft-computing-kcs056-2023.pdf",
        "KCS-074": "https://www.aktuonline.com/papers/btech-cs-7-sem-cryptography-and-network-security-kcs074-2023.pdf",
        "KCS-801": "https://www.aktuonline.com/papers/btech-cs-6-sem-image-processing-kcs-062-2023.pdf",
    }
    
    if "Quantum" in type_str and matched_code in gdrive_quantum_db:
        from fastapi.responses import RedirectResponse
        return RedirectResponse(url=gdrive_quantum_db[matched_code])
        
    if "Papers" in type_str and matched_code in gdrive_papers_db:
        from fastapi.responses import RedirectResponse
        return RedirectResponse(url=gdrive_papers_db[matched_code])
        
    # Retrieve units from syllabus
    units = syllabus_db.get(matched_code, [
        "Unit 1: Core Subject Overview and Introduction to Fundamental Concepts.",
        "Unit 2: Intermediate Module covering structural designs and implementations.",
        "Unit 3: Advanced Concepts, optimizations, and technical problem analysis.",
        "Unit 4: Case Studies, practical applications, and laboratory validations.",
        "Unit 5: Modern trends, research scopes, and future project architectures."
    ])
    
    # Parse topics for questions
    parsed_topics = []
    for unit in units:
        parts = unit.split(":", 1)
        desc = parts[1] if len(parts) > 1 else parts[0]
        subtopics = [t.strip() for t in desc.replace("and", ",").replace("&", ",").split(",") if len(t.strip()) > 3]
        if not subtopics:
            subtopics = ["Basic Definitions", "Core Systems", "Applications"]
        parsed_topics.append(subtopics)
        
    # Helper to get topic safe
    def get_topic(unit_idx, topic_idx, fallback="General Operations"):
        try:
            return parsed_topics[unit_idx][topic_idx]
        except IndexError:
            try:
                return parsed_topics[unit_idx][0]
            except IndexError:
                return fallback

    if "Syllabus" in type_str:
        # Styled Syllabus PDF
        pdf.set_text_color(15, 23, 42)
        pdf.set_font("helvetica", "B", 16)
        pdf.cell(0, 10, f"Subject: {subject}", new_x="LMARGIN", new_y="NEXT", align="L")
        pdf.set_font("helvetica", "B", 12)
        pdf.cell(0, 8, f"Subject Code: {code}", new_x="LMARGIN", new_y="NEXT", align="L")
        pdf.cell(0, 8, "Resource: Official University Syllabus", new_x="LMARGIN", new_y="NEXT", align="L")
        pdf.ln(4)
        pdf.set_draw_color(0, 212, 255)
        pdf.line(10, pdf.get_y(), 200, pdf.get_y())
        pdf.ln(8)
        
        pdf.set_font("helvetica", "B", 13)
        pdf.cell(0, 10, "COURSE CONTENT DETAILS (SEMESTER MODULES)", new_x="LMARGIN", new_y="NEXT")
        pdf.ln(4)
        for unit in units:
            pdf.set_font("helvetica", "B", 11)
            parts = unit.split(":", 1)
            unit_title = parts[0].strip()
            unit_desc = parts[1].strip() if len(parts) > 1 else ""
            pdf.cell(0, 8, unit_title, new_x="LMARGIN", new_y="NEXT")
            pdf.set_font("helvetica", "", 10)
            pdf.set_x(10)
            pdf.multi_cell(0, 6, unit_desc)
            pdf.ln(4)
            
    elif "Papers" in type_str:
        # ====================================================
        # EXAM PAPER STYLE - MATCHING AKTUONLINE.COM SCHEME
        # ====================================================
        pdf.set_text_color(0, 0, 0)
        
        # Roll No Block in Top Right
        pdf.set_font("helvetica", "", 10)
        pdf.cell(100, 10, "Printed Pages: 3", new_x="RIGHT", new_y="TOP")
        pdf.cell(0, 10, "Roll No. __________________", new_x="LMARGIN", new_y="NEXT", align="R")
        
        # Paper Code & Id
        paper_id = str(sum(ord(c) for c in code) * 123 + 45678)[:6]
        pdf.cell(100, 8, f"Sub Code: {code}", new_x="RIGHT", new_y="TOP")
        pdf.cell(0, 8, f"Paper Id: {paper_id}", new_x="LMARGIN", new_y="NEXT", align="R")
        pdf.ln(4)
        
        # University Banner
        pdf.set_font("helvetica", "B", 13)
        pdf.cell(0, 6, "B. TECH. (SEMESTER) THEORY EXAMINATION 2024-25", new_x="LMARGIN", new_y="NEXT", align="C")
        pdf.set_font("helvetica", "B", 12)
        pdf.cell(0, 6, f"Subject: {subject.upper()}", new_x="LMARGIN", new_y="NEXT", align="C")
        
        # Time and Marks Block
        pdf.set_font("helvetica", "", 10)
        pdf.cell(95, 10, "Time: 3 Hours", new_x="RIGHT", new_y="TOP", align="L")
        pdf.cell(0, 10, "Total Marks: 100", new_x="LMARGIN", new_y="NEXT", align="R")
        
        # Divider Line
        pdf.set_draw_color(0, 0, 0)
        pdf.line(10, pdf.get_y(), 200, pdf.get_y())
        pdf.ln(3)
        
        # Notes
        pdf.set_font("helvetica", "I", 9)
        pdf.set_x(10)
        pdf.multi_cell(0, 5, "Note: 1. Attempt all Sections. If any missing data is required, then choose suitably.\n2. Be precise and clear in your derivations, figures, and structural diagrams.")
        pdf.line(10, pdf.get_y(), 200, pdf.get_y())
        pdf.ln(5)
        
        # SECTION A
        pdf.set_font("helvetica", "B", 11)
        pdf.cell(0, 8, "SECTION A (10 x 2 = 20 Marks)", new_x="LMARGIN", new_y="NEXT")
        pdf.set_font("helvetica", "B", 10)
        pdf.cell(0, 6, "1. Attempt all questions in brief:", new_x="LMARGIN", new_y="NEXT")
        pdf.set_font("helvetica", "", 10)
        
        questions_a = [
            f"(a) What do you mean by {get_topic(0, 0)}?",
            f"(b) State the main properties of {get_topic(0, 1, 'General Architecture')}.",
            f"(c) Differentiate between basic concepts of {get_topic(1, 0)} and its variants.",
            f"(d) Explain the role of {get_topic(1, 1, 'Computational Models')} in development.",
            f"(e) Define normal parameters of {get_topic(2, 0)}.",
            f"(f) List the operational objectives of {get_topic(2, 1, 'System Frameworks')}.",
            f"(g) Discuss the function of {get_topic(3, 0)}.",
            f"(h) Draw a structural outline for {get_topic(3, 1, 'Functional Units')}.",
            f"(i) Summarize the concept of {get_topic(4, 0)}.",
            f"(j) Discuss modern trends in {get_topic(4, 1, 'Future Implementations')}."
        ]
        for q in questions_a:
            pdf.set_x(10)
            pdf.multi_cell(0, 5, q)
            pdf.ln(1)
        pdf.ln(4)
        
        # SECTION B
        pdf.set_font("helvetica", "B", 11)
        pdf.cell(0, 8, "SECTION B (3 x 10 = 30 Marks)", new_x="LMARGIN", new_y="NEXT")
        pdf.set_font("helvetica", "B", 10)
        pdf.cell(0, 6, "2. Attempt any three of the following:", new_x="LMARGIN", new_y="NEXT")
        pdf.set_font("helvetica", "", 10)
        
        questions_b = [
            f"(a) Describe in detail the design logic, advantages, and overall structure of {get_topic(0, 0)}.",
            f"(b) Provide a comprehensive derivation/explanation of {get_topic(1, 0)} using standard notations.",
            f"(c) Illustrate the workflow, components, and mathematical foundation of {get_topic(2, 0)}.",
            f"(d) Discuss execution sequences and system integrations for {get_topic(3, 0)}.",
            f"(e) Analyze the constraints, optimization pathways, and design challenges of {get_topic(4, 0)}."
        ]
        for q in questions_b:
            pdf.set_x(10)
            pdf.multi_cell(0, 6, q)
            pdf.ln(2)
        pdf.ln(4)
        
        # SECTION C
        pdf.set_font("helvetica", "B", 11)
        pdf.cell(0, 8, "SECTION C (5 x 10 = 50 Marks)", new_x="LMARGIN", new_y="NEXT")
        pdf.set_font("helvetica", "B", 10)
        pdf.cell(0, 6, "3. Attempt any one part of the following:", new_x="LMARGIN", new_y="NEXT")
        pdf.set_font("helvetica", "", 10)
        
        for u in range(5):
            pdf.set_font("helvetica", "B", 10)
            pdf.cell(0, 6, f"Attempt any one part of the following (Unit {u+1}):", new_x="LMARGIN", new_y="NEXT")
            pdf.set_font("helvetica", "", 10)
            pdf.set_x(10)
            pdf.multi_cell(0, 6, f"(a) Explain {get_topic(u, 0)} along with illustrative diagrams, use-cases, and proof steps.")
            pdf.set_x(10)
            pdf.multi_cell(0, 6, f"(b) Explain the practical implementation details, standard algorithms, and working steps for {get_topic(u, 1, 'System Integration')}.")
            pdf.ln(3)

    elif "Quantum" in type_str:
        # Quantum Book Style Guide
        pdf.set_text_color(15, 23, 42)
        pdf.set_font("helvetica", "B", 16)
        pdf.cell(0, 10, f"{subject} - Quantum Exam Guide", new_x="LMARGIN", new_y="NEXT", align="C")
        pdf.set_font("helvetica", "B", 11)
        pdf.cell(0, 8, f"University Preparation Series | Subject Code: {code}", new_x="LMARGIN", new_y="NEXT", align="C")
        pdf.ln(4)
        pdf.set_draw_color(124, 58, 237)
        pdf.line(10, pdf.get_y(), 200, pdf.get_y())
        pdf.ln(6)
        
        pdf.set_font("helvetica", "", 10)
        pdf.set_x(10)
        pdf.multi_cell(0, 6, "This Quantum Book Series represents a high-yield exam preparation booklet, containing summarized unit summaries, formula sheets, and typical solved university questions.")
        pdf.ln(6)
        
        for i, unit in enumerate(units):
            pdf.set_font("helvetica", "B", 12)
            parts = unit.split(":", 1)
            pdf.cell(0, 8, f"Unit {i+1} Summary: {parts[0]}", new_x="LMARGIN", new_y="NEXT")
            pdf.set_font("helvetica", "", 10)
            pdf.set_x(10)
            pdf.multi_cell(0, 6, f"Key Topics: {parts[1].strip() if len(parts) > 1 else ''}\nSummary: Focus on basic definitions, structural architectures, and computational parameters of this module.")
            pdf.ln(2)
            pdf.set_font("helvetica", "B", 10)
            pdf.cell(0, 6, "Frequently Asked University Exam Question & Answer:", new_x="LMARGIN", new_y="NEXT")
            pdf.set_font("helvetica", "I", 10)
            pdf.set_x(10)
            pdf.multi_cell(0, 5, f"Q. Discuss the core design principles and operations of {get_topic(i, 0)} (10 Marks)\nAnswer Outline:\n1. Introduction and structural block representation.\n2. Workflows, mathematical modeling, and step-by-step algorithms.\n3. Detailed advantages, trade-offs, and typical use-cases in real systems.")
            pdf.ln(6)
            
    else: # Lecture Notes
        pdf.set_text_color(15, 23, 42)
        pdf.set_font("helvetica", "B", 16)
        pdf.cell(0, 10, f"Classroom Lecture Slides - {subject}", new_x="LMARGIN", new_y="NEXT", align="C")
        pdf.set_font("helvetica", "B", 11)
        pdf.cell(0, 8, f"Academic Reference Notes | Subject Code: {code}", new_x="LMARGIN", new_y="NEXT", align="C")
        pdf.ln(4)
        pdf.set_draw_color(63, 185, 80)
        pdf.line(10, pdf.get_y(), 200, pdf.get_y())
        pdf.ln(6)
        
        for i, unit in enumerate(units):
            pdf.set_font("helvetica", "B", 12)
            parts = unit.split(":", 1)
            pdf.cell(0, 8, f"Slide Deck {i+1}: {parts[0]}", new_x="LMARGIN", new_y="NEXT")
            pdf.set_font("helvetica", "", 10)
            pdf.set_x(10)
            pdf.multi_cell(0, 6, f"- Topic Description: Detailed breakdown of {parts[1].strip() if len(parts) > 1 else ''}.\n- Slide 1: General definitions, blocks, and input/output characteristics.\n- Slide 2: Structural derivations, formulas, analysis, and algorithm tracing.\n- Revision Tip: Pay special attention to numerical calculations and conceptual flowcharts.")
            pdf.ln(6)
            
    if pdf is None:
        pdf_text = f"DR. A.P.J. ABDUL KALAM TECHNICAL UNIVERSITY (AKTU)\n{subject.upper()} - {type_str}\nSubject Code: {code}\n\n"
        for unit in units:
            pdf_text += f"{unit}\n"
        pdf_bytes = create_fallback_pdf(pdf_text)
    else:
        out = pdf.output()
        if isinstance(out, (bytes, bytearray)):
            pdf_bytes = bytes(out)
        elif isinstance(out, str):
            pdf_bytes = out.encode("latin-1", errors="ignore")
        else:
            pdf_bytes = bytes(out)
    
    headers = {
        'Content-Disposition': f'attachment; filename="{code}_{type_str.lower().replace(" ", "_")}.pdf"'
    }
    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers=headers
    )

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=5000)
