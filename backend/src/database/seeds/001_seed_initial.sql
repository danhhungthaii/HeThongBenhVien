-- Seed data: Roles
USE HIS_DB;
GO

INSERT INTO Roles (role_name, description) VALUES
('Admin', N'Quản trị hệ thống'),
('Doctor', N'Bác sĩ'),
('Nurse', N'Điều dưỡng'),
('Pharmacist', N'Dược sĩ'),
('Accountant', N'Kế toán'),
('Receptionist', N'Tiếp tân'),
('DepartmentHead', N'Trưởng khoa'),
('QA', N'Kiểm thử viên')
ON CONFLICT (role_name) DO NOTHING;

-- Seed data: Departments
INSERT INTO Departments (department_code, department_name, department_type) VALUES
('KTMH', N'Khoa Tim mạch', 'clinical'),
('KHN', N'Khoa Hô hấp', 'clinical'),
('KTHN', N'Khoa Thần kinh', 'clinical'),
('KDAL', N'Khoa Da liễu', 'clinical'),
('KNH', N'Khoa Nhi', 'clinical'),
('KBV', N'Khoa Bệnh viện', 'clinical'),
('KHCLS', N'Khoa Cận lâm sàng', 'support'),
('KTM', N'Khoa Dược', 'support'),
('KTVP', N'Khoa Tài vụ - Kế toán', 'support'),
('KTG', N'Khoa Tổ chức - Nhân sự', 'support')
ON CONFLICT (department_code) DO NOTHING;
