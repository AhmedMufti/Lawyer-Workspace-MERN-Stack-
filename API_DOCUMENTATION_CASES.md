# 📚 CASE MANAGEMENT API DOCUMENTATION

## Base URL
```
http://localhost:5000/api
```

## Authentication
All endpoints require authentication. Include JWT token in header:
```
Authorization: Bearer {accessToken}
```

---

## 📋 CASE ENDPOINTS

### 1. Create Case
**POST** `/cases`
**Access:** Lawyers only

**Request Body:**
```json
{
  "caseNumber": "LHC/2024/12345",
  "caseTitle": "Muhammad Ali vs State of Pakistan",
  "caseType": "Criminal",
  "priority": "High",
  "court": {
    "name": "Lahore High Court",
    "city": "Lahore",
    "state": "Punjab",
    "courtType": "High Court",
    "courtNumber": "Court No. 5",
    "judge": "Justice Muhammad Anwar"
  },
  "petitioner": {
    "name": "Muhammad Ali",
    "contactNumber": "03001234567",
    "email": "ali@example.com",
    "address": {
      "street": "123 Main Street",
      "city": "Lahore",
      "state": "Punjab",
      "zipCode": "54000"
    },
    "cnic": "35202-1234567-1"
  },
  "respondent": {
    "name": "State of Pakistan",
    "contactNumber": "042-99212345",
    "email": "state@gov.pk"
  },
  "filingDate": "2024-12-01T00:00:00.000Z",
  "firstHearingDate": "2024-12-15T00:00:00.000Z",
  "nextHearingDate": "2024-12-20T00:00:00.000Z",
  "description": "Criminal case regarding corruption allegations",
  "legalIssues": [
    "Section 161 PPC - Bribery",
    "Section 420 PPC - Cheating"
  ],
  "lawsInvolved": [
    {
      "actName": "Pakistan Penal Code",
      "section": "161",
      "articleNumber": "N/A"
    }
  ],
  "estimatedValue": 500000,
  "courtFees": 5000,
  "professionalFees": 50000,
  "tags": ["criminal", "corruption", "high-profile"],
  "category": "Criminal Law"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Case created successfully",
  "data": {
    "case": {
      "_id": "657abc...",
      "caseNumber": "LHC/2024/12345",
      "caseTitle": "Muhammad Ali vs State of Pakistan",
      "caseStatus": "Filed",
      "leadLawyer": {
        "_id": "657...",
        "firstName": "Ahmed",
        "lastName": "Khan",
        "email": "ahmed@law.com"
      },
      "createdAt": "2024-12-14T...",
      "..."
    }
  }
}
```

---

### 2. Get My Cases
**GET** `/cases?page=1&limit=10&status=Filed&type=Criminal`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `status` (optional): Filter by case status
- `type` (optional): Filter by case type
- `priority` (optional): Filter by priority

**Response (200):**
```json
{
  "success": true,
  "message": "Cases retrieved successfully",
  "data": [
    {
      "_id": "657abc...",
      "caseNumber": "LHC/2024/12345",
      "caseTitle": "Muhammad Ali vs State of Pakistan",
      "caseStatus": "Filed",
      "caseType": "Criminal",
      "priority": "High",
      "nextHearingDate": "2024-12-20T...",
      "leadLawyer": {
        "firstName": "Ahmed",
        "lastName": "Khan"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3,
    "hasMore": true
  }
}
```

---

### 3. Get Case by ID
**GET** `/cases/:id`

**Response (200):**
```json
{
  "success": true,
  "message": "Case retrieved successfully",
  "data": {
    "case": {
      "_id": "657abc...",
      "caseNumber": "LHC/2024/12345",
      "caseTitle": "Muhammad Ali vs State of Pakistan",
      "caseType": "Criminal",
      "caseStatus": "Filed",
      "priority": "High",
      "court": {
        "name": "Lahore High Court",
        "city": "Lahore",
        "courtType": "High Court",
        "judge": "Justice Muhammad Anwar"
      },
      "petitioner": { "..." },
      "respondent": { "..." },
      "leadLawyer": { "..." },
      "associatedLawyers": [],
      "clerks": [],
      "totalHearings": 0,
      "completedHearings": 0,
      "totalDocuments": 0,
      "caseAgeDays": 13,
      "daysUntilNextHearing": 6,
      "progressPercentage": 0
    }
  }
}
```

---

### 4. Update Case
**PATCH** `/cases/:id`
**Access:** Lead lawyer or Admin only

**Request Body:** (Any fields from create, all optional)
```json
{
  "caseStatus": "In Progress",
  "priority": "Urgent",
  "nextHearingDate": "2024-12-25T00:00:00.000Z",
  "description": "Updated description...",
  "courtFees": 6000
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Case updated successfully",
  "data": {
    "case": { "..." }
  }
}
```

---

### 5. Delete Case (Soft Delete)
**DELETE** `/cases/:id`
**Access:** Lead lawyer or Admin only

**Response (200):**
```json
{
  "success": true,
  "message": "Case deleted successfully"
}
```

---

### 6. Archive Case
**POST** `/cases/:id/archive`
**Access:** Lead lawyer or Admin only

**Response (200):**
```json
{
  "success": true,
  "message": "Case archived successfully",
  "data": {
    "case": {
      "_id": "657abc...",
      "isArchived": true,
      "archivedAt": "2024-12-14T...",
      "caseStatus": "Archived"
    }
  }
}
```

---

### 7. Add Lawyer to Case
**POST** `/cases/:id/lawyers`
**Access:** Lead lawyer or Admin only

**Request Body:**
```json
{
  "lawyerId": "657def...",
  "role": "Junior Counsel"
}
```

**Available Roles:**
- Senior Counsel
- Junior Counsel
- Assistant
- Consultant

**Response (200):**
```json
{
  "success": true,
  "message": "Lawyer added to case successfully",
  "data": {
    "case": {
      "associatedLawyers": [
        {
          "lawyer": {
            "_id": "657def...",
            "firstName": "Sara",
            "lastName": "Ahmed"
          },
          "role": "Junior Counsel",
          "addedAt": "2024-12-14T..."
        }
      ]
    }
  }
}
```

---

### 8. Add Clerk to Case
**POST** `/cases/:id/clerks`
**Access:** Lead lawyer or Admin only

**Request Body:**
```json
{
  "clerkId": "657ghi..."
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Clerk added to case successfully",
  "data": {
    "case": {
      "clerks": [
        {
          "_id": "657ghi...",
          "firstName": "Hassan",
          "lastName": "Ali"
        }
      ]
    }
  }
}
```

---

### 9. Add Task to Case
**POST** `/cases/:id/tasks`

**Request Body:**
```json
{
  "task": "Prepare evidence for next hearing",
  "dueDate": "2024-12-19T00:00:00.000Z",
  "assignedTo": "657def..."
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Task added successfully",
  "data": {
    "case": {
      "pendingTasks": [
        {
          "_id": "657jkl...",
          "task": "Prepare evidence for next hearing",
          "dueDate": "2024-12-19T...",
          "assignedTo": {
            "firstName": "Sara",
            "lastName": "Ahmed"
          },
          "status": "Pending"
        }
      ]
    }
  }
}
```

---

### 10. Update Task Status
**PATCH** `/cases/:id/tasks/:taskId`

**Request Body:**
```json
{
  "status": "Completed"
}
```

**Available Statuses:**
- Pending
- In Progress
- Completed

**Response (200):**
```json
{
  "success": true,
  "message": "Task status updated successfully",
  "data": {
    "task": {
      "_id": "657jkl...",
      "task": "Prepare evidence for next hearing",
      "status": "Completed"
    }
  }
}
```

---

### 11. Search Cases
**GET** `/cases/search?query=Ali&caseType=Criminal&page=1&limit=10`

**Query Parameters:**
- `query` (optional): Search term (searches in case number, title, description, parties)
- `caseType` (optional): Filter by case type
- `caseStatus` (optional): Filter by status
- `city` (optional): Filter by court city
- `fromDate` (optional): Filing date from (YYYY-MM-DD)
- `toDate` (optional): Filing date to (YYYY-MM-DD)
- `priority` (optional): Filter by priority
- `tags` (optional): Filter by tags (can be array)
- `page` (optional): Page number
- `limit` (optional): Items per page (max 100)

**Response (200):**
```json
{
  "success": true,
  "message": "Search results retrieved successfully",
  "data": [
    { "..." }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 3,
    "totalPages": 1,
    "hasMore": false
  }
}
```

---

### 12. Get Upcoming Hearings
**GET** `/cases/upcoming-hearings?days=7`

**Query Parameters:**
- `days` (optional): Number of days to look ahead (default: 7)

**Response (200):**
```json
{
  "success": true,
  "message": "Upcoming hearings retrieved successfully",
  "data": {
    "cases": [
      {
        "_id": "657abc...",
        "caseNumber": "LHC/2024/12345",
        "caseTitle": "Muhammad Ali vs State of Pakistan",
        "nextHearingDate": "2024-12-20T...",
        "daysUntilNextHearing": 6
      }
    ],
    "count": 1
  }
}
```

---

### 13. Get Case Statistics
**GET** `/cases/statistics`

**Response (200):**
```json
{
  "success": true,
  "message": "Statistics retrieved successfully",
  "data": {
    "statistics": {
      "total": 25,
      "byStatus": {
        "Filed": 5,
        "In Progress": 15,
        "Hearing Scheduled": 3,
        "Decided": 2
      },
      "byType": {
        "Criminal": 10,
        "Civil": 8,
        "Family": 5,
        "Corporate": 2
      },
      "byPriority": {
        "Low": 5,
        "Medium": 12,
        "High": 6,
        "Urgent": 2
      },
      "active": 23,
      "archived": 2,
      "upcomingHearings": 4
    }
  }
}
```

---

## 🔒 Authorization Rules

| Endpoint | Lawyer | Litigant | Clerk | Admin |
|----------|--------|----------|-------|-------|
| Create Case | ✅ | ❌ | ❌ | ✅ |
| Get My Cases | ✅ | ✅ | ✅ | ✅ |
| Get Case by ID | ✅ (if access) | ✅ (if access) | ✅ (if access) | ✅ |
| Update Case | ✅ (lead only) | ❌ | ❌ | ✅ |
| Delete Case | ✅ (lead only) | ❌ | ❌ | ✅ |
| Archive Case | ✅ (lead only) | ❌ | ❌ | ✅ |
| Add Lawyer | ✅ (lead only) | ❌ | ❌ | ✅ |
| Add Clerk | ✅ (lead only) | ❌ | ❌ | ✅ |
| Add Task | ✅ (if access) | ❌ | ✅ (if access) | ✅ |
| Update Task | ✅ (if assigned/access) | ❌ | ✅ (if assigned) | ✅ |
| Search | ✅ | ✅ | ✅ | ✅ |
| Statistics | ✅ | ✅ | ✅ | ✅ |

---

## 📝 Validation Rules

### Case Number
- Required
- Unique
- Max 100 characters
- Auto-converted to UPPERCASE

### Case Title
- Required
- Max 500 characters

### Case Type
Must be one of:
- Civil
- Criminal
- Family
- Corporate
- Constitutional
- Tax
- Labor
- Property
- Intellectual Property
- Administrative
- Other

### Case Status
- Filed (default)
- Under Review
- Admitted
- In Progress
- Hearing Scheduled
- Judgment Reserved
- Decided
- Dismissed
- Withdrawn
- Settled
- Archived

### Priority
- Low
- Medium (default)
- High
- Urgent

### Filing Date
- Required
- Cannot be in the future

---

## ⚠️ Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "caseNumber",
      "message": "Case number is required"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "You are not logged in. Please log in to access this resource."
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Only lawyers can create cases"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Case not found"
}
```

---

## 🧪 Testing Workflow

1. **Register/Login as Lawyer**
   ```
   POST /api/auth/login
   Save the accessToken
   ```

2. **Create a Case**
   ```
   POST /api/cases
   Include Authorization header
   Save the case ID
   ```

3. **Get Your Cases**
   ```
   GET /api/cases
   ```

4. **Update Case**
   ```
   PATCH /api/cases/{id}
   ```

5. **Add Team Members**
   ```
   POST /api/cases/{id}/lawyers
   POST /api/cases/{id}/clerks
   ```

6. **Add Tasks**
   ```
   POST /api/cases/{id}/tasks
   ```

7. **Search Cases**
   ```
   GET /api/cases/search?query=test
   ```

8. **Get Statistics**
   ```
   GET /api/cases/statistics
   ```

---

**✅ All endpoints are ready for testing!**
