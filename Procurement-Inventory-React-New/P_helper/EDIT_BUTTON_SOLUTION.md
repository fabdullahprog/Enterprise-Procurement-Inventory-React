# 🔧 Edit Button সমস্যা - সমাধান

## 🔍 সমস্যা বিশ্লেষণ:

আপনি `depthead@supershop.com` দিয়ে login করেছেন এবং দেখছেন:

### Screenshot 1: Requisition Detail (PR-2026-003)
- ✅ Approve button আছে
- ✅ Reject button আছে
- ✅ Delete button আছে
- ❌ **Edit button নেই**

### Screenshot 2: Pending Approvals List
- ✅ Approve Requisition button আছে
- ✅ Reject Requisition button আছে
- ❌ **Edit button নেই**

---

## 🎯 কেন Edit Button নেই?

### কারণ ১: এটা Purchase Requisition
- আপনার screenshot এ **PR-2026-003** দেখা যাচ্ছে
- এটা `Requisitions` table এর data (Purchase Requisition)
- এটা **Store Department** create করেছে
- Department Head এর জন্য এটা edit করার কথা না!

### কারণ ২: Employee Requisition আলাদা
- Employee Requisition এর জন্য আলাদা page আছে: **"Dept Head Approvals"**
- সেখানে Edit button আছে
- কিন্তু আপনার কাছে Employee Requisition নেই (তাই 0 data)

---

## ✅ সমাধান:

আমি **দুইটা option** দিচ্ছি:

### Option 1: ✅ **Recommended - Purchase Requisition এও Edit button add করি**

"Pending Approvals" page এ Edit button add করব যাতে:
- Department Head তার department এর Purchase Requisitions edit করতে পারে
- Edit modal/form থাকবে
- Items edit করা যাবে
- Notes/Dates edit করা যাবে

**Benefits:**
- ✅ Flexible - যেকোনো requisition edit করা যাবে
- ✅ User friendly
- ✅ আপনার current data এর সাথে কাজ করবে

---

### Option 2: শুধু Employee Requisition এ Edit রাখি

"Dept Head Approvals" page এ Edit button আছে (already implemented)
কিন্তু আপনার কাছে Employee Requisition নেই, তাই দেখা যাচ্ছে না।

**Solution:** Employee হিসেবে requisition create করুন নতুন page থেকে।

---

## 🚀 আমি Option 1 implement করব

আমি এখন "Pending Approvals" page এ Edit functionality add করব:

### Features:
1. ✅ Edit button প্রতিটি requisition এ
2. ✅ Edit modal যেখানে:
   - Requisition date edit করা যাবে
   - Required by date edit করা যাবে
   - Notes edit করা যাবে
   - Items add/remove/edit করা যাবে
3. ✅ Save button
4. ✅ Backend API call করবে

---

## 📝 Implementation Plan:

### 1. Backend API Check
Purchase Requisition edit করার API আছে কিনা check করব

### 2. Frontend Edit Modal
Edit form/modal তৈরি করব

### 3. Permission Check
DepartmentHead role এর জন্য edit permission add করব

### 4. Test
Edit functionality test করব

---

**Confirm করুন আমি Option 1 implement করি!**

অথবা বলুন আপনি কি চান:
- **A:** Purchase Requisition এও Edit button চাই (Option 1)
- **B:** শুধু Employee Requisition এ Edit রাখি, Purchase Requisition এ না (Option 2)
