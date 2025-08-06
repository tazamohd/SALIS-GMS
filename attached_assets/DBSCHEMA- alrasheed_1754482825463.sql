-- DROP SCHEMA dbo;

CREATE SCHEMA dbo;
-- db_ab1bb9_salisautogms.dbo.CarMakes definition

-- Drop table

-- DROP TABLE db_ab1bb9_salisautogms.dbo.CarMakes;

CREATE TABLE db_ab1bb9_salisautogms.dbo.CarMakes (
	Id int IDENTITY(1,1) NOT NULL,
	Name nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	Country nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CONSTRAINT PK_CarMakes PRIMARY KEY (Id)
);


-- db_ab1bb9_salisautogms.dbo.Cities definition

-- Drop table

-- DROP TABLE db_ab1bb9_salisautogms.dbo.Cities;

CREATE TABLE db_ab1bb9_salisautogms.dbo.Cities (
	Id int IDENTITY(1,1) NOT NULL,
	Name nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	CONSTRAINT PK_Cities PRIMARY KEY (Id)
);


-- db_ab1bb9_salisautogms.dbo.Customers definition

-- Drop table

-- DROP TABLE db_ab1bb9_salisautogms.dbo.Customers;

CREATE TABLE db_ab1bb9_salisautogms.dbo.Customers (
	Id uniqueidentifier NOT NULL,
	FullName nvarchar(250) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	Email nvarchar(400) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	PrimaryPhoneNumber nvarchar(50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	SecondaryPhoneNumber nvarchar(50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	Address nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	Notify bit NOT NULL,
	CreatedBy uniqueidentifier DEFAULT '00000000-0000-0000-0000-000000000000' NOT NULL,
	CreatedOn datetime2 DEFAULT '0001-01-01T00:00:00.0000000' NOT NULL,
	DeletedBy uniqueidentifier NULL,
	DeletedOn datetime2 NULL,
	IsDeleted bit DEFAULT CONVERT([bit],(0)) NOT NULL,
	ModifiedBy uniqueidentifier NULL,
	ModifiedOn datetime2 NULL,
	CONSTRAINT PK_Customers PRIMARY KEY (Id)
);
 CREATE  UNIQUE NONCLUSTERED INDEX IX_Customers_Email ON dbo.Customers (  Email ASC  )  
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
 CREATE  UNIQUE NONCLUSTERED INDEX IX_Customers_PrimaryPhoneNumber ON dbo.Customers (  PrimaryPhoneNumber ASC  )  
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;


-- db_ab1bb9_salisautogms.dbo.Gender definition

-- Drop table

-- DROP TABLE db_ab1bb9_salisautogms.dbo.Gender;

CREATE TABLE db_ab1bb9_salisautogms.dbo.Gender (
	Id int IDENTITY(1,1) NOT NULL,
	Name nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	CONSTRAINT PK_Gender PRIMARY KEY (Id)
);


-- db_ab1bb9_salisautogms.dbo.Inventories definition

-- Drop table

-- DROP TABLE db_ab1bb9_salisautogms.dbo.Inventories;

CREATE TABLE db_ab1bb9_salisautogms.dbo.Inventories (
	Id int IDENTITY(1,1) NOT NULL,
	InventoryCode nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	TransactionDate datetime2 NOT NULL,
	ReferenceId nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	Notes nvarchar(1000) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	CreatedOn datetime2 NOT NULL,
	CreatedBy uniqueidentifier NOT NULL,
	ModifiedOn datetime2 NULL,
	ModifiedBy uniqueidentifier NULL,
	IsDeleted bit DEFAULT CONVERT([bit],(0)) NOT NULL,
	DeletedOn datetime2 NULL,
	DeletedBy uniqueidentifier NULL,
	ShippingFee_Amount decimal(18,2) NOT NULL,
	ShippingFee_Currency nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	HandlingFee_Amount decimal(18,2) NOT NULL,
	HandlingFee_Currency nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	OtherFees_Amount decimal(18,2) NOT NULL,
	OtherFees_Currency nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	CONSTRAINT PK_Inventories PRIMARY KEY (Id)
);


-- db_ab1bb9_salisautogms.dbo.InventoryTransactionTypes definition

-- Drop table

-- DROP TABLE db_ab1bb9_salisautogms.dbo.InventoryTransactionTypes;

CREATE TABLE db_ab1bb9_salisautogms.dbo.InventoryTransactionTypes (
	Id int IDENTITY(1,1) NOT NULL,
	Name nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	Symbol nvarchar(2) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	Multiplier int NOT NULL,
	CONSTRAINT PK_InventoryTransactionTypes PRIMARY KEY (Id)
);


-- db_ab1bb9_salisautogms.dbo.JobTitles definition

-- Drop table

-- DROP TABLE db_ab1bb9_salisautogms.dbo.JobTitles;

CREATE TABLE db_ab1bb9_salisautogms.dbo.JobTitles (
	Id int IDENTITY(1,1) NOT NULL,
	Name nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	CONSTRAINT PK_JobTitles PRIMARY KEY (Id)
);


-- db_ab1bb9_salisautogms.dbo.OutboxMessages definition

-- Drop table

-- DROP TABLE db_ab1bb9_salisautogms.dbo.OutboxMessages;

CREATE TABLE db_ab1bb9_salisautogms.dbo.OutboxMessages (
	Id uniqueidentifier NOT NULL,
	OccurredOnUtc datetime2 NOT NULL,
	[Type] nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	Content nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	ProcessedOnUtc datetime2 NULL,
	Error nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CONSTRAINT PK_OutboxMessages PRIMARY KEY (Id)
);


-- db_ab1bb9_salisautogms.dbo.Packages definition

-- Drop table

-- DROP TABLE db_ab1bb9_salisautogms.dbo.Packages;

CREATE TABLE db_ab1bb9_salisautogms.dbo.Packages (
	Id int IDENTITY(1,1) NOT NULL,
	Name nvarchar(200) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	Description nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	Price_Amount decimal(18,2) NOT NULL,
	Price_Currency nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	CreatedBy uniqueidentifier NOT NULL,
	CreatedOn datetime2 NOT NULL,
	DeletedBy uniqueidentifier NULL,
	DeletedOn datetime2 NULL,
	IsDeleted bit DEFAULT CONVERT([bit],(0)) NOT NULL,
	ModifiedBy uniqueidentifier NULL,
	ModifiedOn datetime2 NULL,
	EstimatedDuration time NULL,
	CONSTRAINT PK_Packages PRIMARY KEY (Id)
);


-- db_ab1bb9_salisautogms.dbo.PartCategories definition

-- Drop table

-- DROP TABLE db_ab1bb9_salisautogms.dbo.PartCategories;

CREATE TABLE db_ab1bb9_salisautogms.dbo.PartCategories (
	Id int IDENTITY(1,1) NOT NULL,
	Name nvarchar(250) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	ParentId int NOT NULL,
	Description nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	CreatedOn datetime2 NOT NULL,
	ModifiedOn datetime2 NULL,
	CONSTRAINT PK_PartCategories PRIMARY KEY (Id)
);


-- db_ab1bb9_salisautogms.dbo.PartTypes definition

-- Drop table

-- DROP TABLE db_ab1bb9_salisautogms.dbo.PartTypes;

CREATE TABLE db_ab1bb9_salisautogms.dbo.PartTypes (
	Id int IDENTITY(1,1) NOT NULL,
	Name nvarchar(250) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	CONSTRAINT PK_PartTypes PRIMARY KEY (Id)
);


-- db_ab1bb9_salisautogms.dbo.PartsUnits definition

-- Drop table

-- DROP TABLE db_ab1bb9_salisautogms.dbo.PartsUnits;

CREATE TABLE db_ab1bb9_salisautogms.dbo.PartsUnits (
	Id int IDENTITY(1,1) NOT NULL,
	Name nvarchar(250) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	Symbol nvarchar(50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	Description nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	CreatedOn datetime2 NOT NULL,
	ModifiedOn datetime2 NULL,
	CONSTRAINT PK_PartsUnits PRIMARY KEY (Id)
);


-- db_ab1bb9_salisautogms.dbo.PaymentMethods definition

-- Drop table

-- DROP TABLE db_ab1bb9_salisautogms.dbo.PaymentMethods;

CREATE TABLE db_ab1bb9_salisautogms.dbo.PaymentMethods (
	Id int IDENTITY(1,1) NOT NULL,
	Name nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	CONSTRAINT PK_PaymentMethods PRIMARY KEY (Id)
);


-- db_ab1bb9_salisautogms.dbo.Permissions definition

-- Drop table

-- DROP TABLE db_ab1bb9_salisautogms.dbo.Permissions;

CREATE TABLE db_ab1bb9_salisautogms.dbo.Permissions (
	Id int IDENTITY(1,1) NOT NULL,
	Name nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	CONSTRAINT PK_Permissions PRIMARY KEY (Id)
);


-- db_ab1bb9_salisautogms.dbo.PhoneVerificationOTPs definition

-- Drop table

-- DROP TABLE db_ab1bb9_salisautogms.dbo.PhoneVerificationOTPs;

CREATE TABLE db_ab1bb9_salisautogms.dbo.PhoneVerificationOTPs (
	Id uniqueidentifier NOT NULL,
	PhoneNumber nvarchar(50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	OTP int NOT NULL,
	CreatedOnUtc datetime2 NOT NULL,
	ExpiresOnUtc datetime2 NOT NULL,
	CONSTRAINT PK_PhoneVerificationOTPs PRIMARY KEY (Id)
);


-- db_ab1bb9_salisautogms.dbo.PricingTypes definition

-- Drop table

-- DROP TABLE db_ab1bb9_salisautogms.dbo.PricingTypes;

CREATE TABLE db_ab1bb9_salisautogms.dbo.PricingTypes (
	Id int NOT NULL,
	Name nvarchar(50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	CONSTRAINT PK_PricingTypes PRIMARY KEY (Id)
);


-- db_ab1bb9_salisautogms.dbo.Priorities definition

-- Drop table

-- DROP TABLE db_ab1bb9_salisautogms.dbo.Priorities;

CREATE TABLE db_ab1bb9_salisautogms.dbo.Priorities (
	Id int IDENTITY(1,1) NOT NULL,
	Name nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	CONSTRAINT PK_Priorities PRIMARY KEY (Id)
);


-- db_ab1bb9_salisautogms.dbo.Roles definition

-- Drop table

-- DROP TABLE db_ab1bb9_salisautogms.dbo.Roles;

CREATE TABLE db_ab1bb9_salisautogms.dbo.Roles (
	Id int IDENTITY(1,1) NOT NULL,
	Name nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	CONSTRAINT PK_Roles PRIMARY KEY (Id)
);


-- db_ab1bb9_salisautogms.dbo.ServiceTypes definition

-- Drop table

-- DROP TABLE db_ab1bb9_salisautogms.dbo.ServiceTypes;

CREATE TABLE db_ab1bb9_salisautogms.dbo.ServiceTypes (
	Id int NOT NULL,
	Name nvarchar(50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	CONSTRAINT PK_ServiceTypes PRIMARY KEY (Id)
);


-- db_ab1bb9_salisautogms.dbo.Suppliers definition

-- Drop table

-- DROP TABLE db_ab1bb9_salisautogms.dbo.Suppliers;

CREATE TABLE db_ab1bb9_salisautogms.dbo.Suppliers (
	Id int IDENTITY(1,1) NOT NULL,
	Name nvarchar(200) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	Email nvarchar(200) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	PhoneNumber nvarchar(20) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	Specialization nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	CreatedBy uniqueidentifier NOT NULL,
	CreatedOn datetime2 NOT NULL,
	ModifiedBy uniqueidentifier NULL,
	ModifiedOn datetime2 NULL,
	IsDeleted bit DEFAULT CONVERT([bit],(0)) NOT NULL,
	DeletedBy uniqueidentifier NULL,
	DeletedOn datetime2 NULL,
	CONSTRAINT PK_Suppliers PRIMARY KEY (Id)
);


-- db_ab1bb9_salisautogms.dbo.[__EFMigrationsHistory] definition

-- Drop table

-- DROP TABLE db_ab1bb9_salisautogms.dbo.[__EFMigrationsHistory];

CREATE TABLE db_ab1bb9_salisautogms.dbo.[__EFMigrationsHistory] (
	MigrationId nvarchar(150) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	ProductVersion nvarchar(32) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	CONSTRAINT PK___EFMigrationsHistory PRIMARY KEY (MigrationId)
);


-- db_ab1bb9_salisautogms.dbo.CarModels definition

-- Drop table

-- DROP TABLE db_ab1bb9_salisautogms.dbo.CarModels;

CREATE TABLE db_ab1bb9_salisautogms.dbo.CarModels (
	Id int IDENTITY(1,1) NOT NULL,
	CarMakeId int NOT NULL,
	Name nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[Year] int NULL,
	CarMakeId1 int NULL,
	CONSTRAINT PK_CarModels PRIMARY KEY (Id),
	CONSTRAINT FK_CarModels_CarMakes_CarMakeId FOREIGN KEY (CarMakeId) REFERENCES db_ab1bb9_salisautogms.dbo.CarMakes(Id) ON DELETE CASCADE,
	CONSTRAINT FK_CarModels_CarMakes_CarMakeId1 FOREIGN KEY (CarMakeId1) REFERENCES db_ab1bb9_salisautogms.dbo.CarMakes(Id)
);
 CREATE NONCLUSTERED INDEX IX_CarModels_CarMakeId ON dbo.CarModels (  CarMakeId ASC  )  
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
 CREATE NONCLUSTERED INDEX IX_CarModels_CarMakeId1 ON dbo.CarModels (  CarMakeId1 ASC  )  
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;


-- db_ab1bb9_salisautogms.dbo.CustomerCars definition

-- Drop table

-- DROP TABLE db_ab1bb9_salisautogms.dbo.CustomerCars;

CREATE TABLE db_ab1bb9_salisautogms.dbo.CustomerCars (
	Id uniqueidentifier NOT NULL,
	CustomerId uniqueidentifier NOT NULL,
	PlateNumber nvarchar(20) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	CarClass nvarchar(50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	VinNumber nvarchar(50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	Make nvarchar(50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	Model nvarchar(50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[Year] int NOT NULL,
	Color nvarchar(50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	CreatedBy uniqueidentifier DEFAULT '00000000-0000-0000-0000-000000000000' NOT NULL,
	CreatedOn datetime2 DEFAULT '0001-01-01T00:00:00.0000000' NOT NULL,
	DeletedBy uniqueidentifier NULL,
	DeletedOn datetime2 NULL,
	IsDeleted bit DEFAULT CONVERT([bit],(0)) NOT NULL,
	ModifiedBy uniqueidentifier NULL,
	ModifiedOn datetime2 NULL,
	TecDocBrandId int DEFAULT 0 NOT NULL,
	TecDocId int DEFAULT 0 NOT NULL,
	TecDocLinkedOn uniqueidentifier NULL,
	TecDocModelId int DEFAULT 0 NOT NULL,
	CONSTRAINT PK_CustomerCars PRIMARY KEY (Id),
	CONSTRAINT FK_CustomerCars_Customers_CustomerId FOREIGN KEY (CustomerId) REFERENCES db_ab1bb9_salisautogms.dbo.Customers(Id) ON DELETE CASCADE
);
 CREATE NONCLUSTERED INDEX IX_CustomerCars_CustomerId ON dbo.CustomerCars (  CustomerId ASC  )  
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
 CREATE  UNIQUE NONCLUSTERED INDEX IX_CustomerCars_VinNumber ON dbo.CustomerCars (  VinNumber ASC  )  
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;


-- db_ab1bb9_salisautogms.dbo.Parts definition

-- Drop table

-- DROP TABLE db_ab1bb9_salisautogms.dbo.Parts;

CREATE TABLE db_ab1bb9_salisautogms.dbo.Parts (
	Id int IDENTITY(1,1) NOT NULL,
	Name nvarchar(250) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	CategoryId int NOT NULL,
	PartTypeId int NOT NULL,
	UnitId int NOT NULL,
	Manufacturer nvarchar(250) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	StockQuantity int NOT NULL,
	PurchaseTax decimal(18,2) NOT NULL,
	PurchasePrice_Amount decimal(18,2) NOT NULL,
	PurchasePrice_Currency nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	SalesTax decimal(18,2) NOT NULL,
	SalesPrice_Amount decimal(18,2) NOT NULL,
	SalesPrice_Currency nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	Description nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	CreatedOn datetime2 NOT NULL,
	ModifiedOn datetime2 NULL,
	PartCategoryId int NULL,
	CreatedBy uniqueidentifier DEFAULT '00000000-0000-0000-0000-000000000000' NOT NULL,
	DeletedBy uniqueidentifier NULL,
	DeletedOn datetime2 NULL,
	IsDeleted bit DEFAULT CONVERT([bit],(0)) NOT NULL,
	ModifiedBy uniqueidentifier NULL,
	OEMNumber nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS DEFAULT N'' NOT NULL,
	SKU nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS DEFAULT N'' NOT NULL,
	CONSTRAINT PK_Parts PRIMARY KEY (Id),
	CONSTRAINT FK_Parts_PartCategories_CategoryId FOREIGN KEY (CategoryId) REFERENCES db_ab1bb9_salisautogms.dbo.PartCategories(Id),
	CONSTRAINT FK_Parts_PartCategories_PartCategoryId FOREIGN KEY (PartCategoryId) REFERENCES db_ab1bb9_salisautogms.dbo.PartCategories(Id),
	CONSTRAINT FK_Parts_PartTypes_PartTypeId FOREIGN KEY (PartTypeId) REFERENCES db_ab1bb9_salisautogms.dbo.PartTypes(Id),
	CONSTRAINT FK_Parts_PartsUnits_UnitId FOREIGN KEY (UnitId) REFERENCES db_ab1bb9_salisautogms.dbo.PartsUnits(Id)
);
 CREATE NONCLUSTERED INDEX IX_Parts_CategoryId ON dbo.Parts (  CategoryId ASC  )  
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
 CREATE NONCLUSTERED INDEX IX_Parts_PartCategoryId ON dbo.Parts (  PartCategoryId ASC  )  
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
 CREATE NONCLUSTERED INDEX IX_Parts_PartTypeId ON dbo.Parts (  PartTypeId ASC  )  
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
 CREATE NONCLUSTERED INDEX IX_Parts_UnitId ON dbo.Parts (  UnitId ASC  )  
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;


-- db_ab1bb9_salisautogms.dbo.PurchaseOrders definition

-- Drop table

-- DROP TABLE db_ab1bb9_salisautogms.dbo.PurchaseOrders;

CREATE TABLE db_ab1bb9_salisautogms.dbo.PurchaseOrders (
	Id int IDENTITY(1,1) NOT NULL,
	OrderNo nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	Status nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	SupplierId int NOT NULL,
	City nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	Area nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	Address nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	OrderDate datetime2 NOT NULL,
	ReferenceId nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	Notes nvarchar(1000) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	CreatedBy uniqueidentifier NOT NULL,
	CreatedOn datetime2 NOT NULL,
	ModifiedOn datetime2 NULL,
	ModifiedBy uniqueidentifier NULL,
	IsDeleted bit DEFAULT CONVERT([bit],(0)) NOT NULL,
	DeletedOn datetime2 NULL,
	DeletedBy uniqueidentifier NULL,
	ShippingFee_Amount decimal(18,2) NOT NULL,
	ShippingFee_Currency nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	HandlingFee_Amount decimal(18,2) NOT NULL,
	HandlingFee_Currency nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	OtherFees_Amount decimal(18,2) NOT NULL,
	OtherFees_Currency nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	SubTotal_Amount decimal(18,2) DEFAULT 0.0 NOT NULL,
	SubTotal_Currency nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS DEFAULT N'' NOT NULL,
	TotalWithFees_Amount decimal(18,2) DEFAULT 0.0 NOT NULL,
	TotalWithFees_Currency nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS DEFAULT N'' NOT NULL,
	PaymentMethodId int DEFAULT 0 NOT NULL,
	CONSTRAINT PK_PurchaseOrders PRIMARY KEY (Id),
	CONSTRAINT FK_PurchaseOrders_PaymentMethods_PaymentMethodId FOREIGN KEY (PaymentMethodId) REFERENCES db_ab1bb9_salisautogms.dbo.PaymentMethods(Id),
	CONSTRAINT FK_PurchaseOrders_Suppliers_SupplierId FOREIGN KEY (SupplierId) REFERENCES db_ab1bb9_salisautogms.dbo.Suppliers(Id)
);
 CREATE NONCLUSTERED INDEX IX_PurchaseOrders_PaymentMethodId ON dbo.PurchaseOrders (  PaymentMethodId ASC  )  
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
 CREATE NONCLUSTERED INDEX IX_PurchaseOrders_SupplierId ON dbo.PurchaseOrders (  SupplierId ASC  )  
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;


-- db_ab1bb9_salisautogms.dbo.RolePermissions definition

-- Drop table

-- DROP TABLE db_ab1bb9_salisautogms.dbo.RolePermissions;

CREATE TABLE db_ab1bb9_salisautogms.dbo.RolePermissions (
	RoleId int NOT NULL,
	PermissionId int NOT NULL,
	CONSTRAINT PK_RolePermissions PRIMARY KEY (RoleId,PermissionId),
	CONSTRAINT FK_RolePermissions_Permissions_PermissionId FOREIGN KEY (PermissionId) REFERENCES db_ab1bb9_salisautogms.dbo.Permissions(Id) ON DELETE CASCADE,
	CONSTRAINT FK_RolePermissions_Roles_RoleId FOREIGN KEY (RoleId) REFERENCES db_ab1bb9_salisautogms.dbo.Roles(Id) ON DELETE CASCADE
);
 CREATE NONCLUSTERED INDEX IX_RolePermissions_PermissionId ON dbo.RolePermissions (  PermissionId ASC  )  
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;


-- db_ab1bb9_salisautogms.dbo.Services definition

-- Drop table

-- DROP TABLE db_ab1bb9_salisautogms.dbo.Services;

CREATE TABLE db_ab1bb9_salisautogms.dbo.Services (
	Id uniqueidentifier NOT NULL,
	Name nvarchar(200) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	Description nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	Price_Amount decimal(18,2) NOT NULL,
	Price_Currency nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	CreatedBy uniqueidentifier DEFAULT '00000000-0000-0000-0000-000000000000' NOT NULL,
	CreatedOn datetime2 DEFAULT '0001-01-01T00:00:00.0000000' NOT NULL,
	DeletedBy uniqueidentifier NULL,
	DeletedOn datetime2 NULL,
	IsDeleted bit DEFAULT CONVERT([bit],(0)) NOT NULL,
	ModifiedBy uniqueidentifier NULL,
	ModifiedOn datetime2 NULL,
	ServiceTypeId int DEFAULT 0 NOT NULL,
	EstimatedDuration time DEFAULT '00:00:00' NOT NULL,
	PricingTypeId int DEFAULT 0 NOT NULL,
	TechnicianSkillsRequired nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS DEFAULT N'' NOT NULL,
	ToolsEquipmentRequired nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS DEFAULT N'' NOT NULL,
	CONSTRAINT PK_Services PRIMARY KEY (Id),
	CONSTRAINT FK_Services_PricingTypes_PricingTypeId FOREIGN KEY (PricingTypeId) REFERENCES db_ab1bb9_salisautogms.dbo.PricingTypes(Id),
	CONSTRAINT FK_Services_ServiceTypes_ServiceTypeId FOREIGN KEY (ServiceTypeId) REFERENCES db_ab1bb9_salisautogms.dbo.ServiceTypes(Id)
);
 CREATE NONCLUSTERED INDEX IX_Services_PricingTypeId ON dbo.Services (  PricingTypeId ASC  )  
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
 CREATE NONCLUSTERED INDEX IX_Services_ServiceTypeId ON dbo.Services (  ServiceTypeId ASC  )  
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;


-- db_ab1bb9_salisautogms.dbo.Technicians definition

-- Drop table

-- DROP TABLE db_ab1bb9_salisautogms.dbo.Technicians;

CREATE TABLE db_ab1bb9_salisautogms.dbo.Technicians (
	Id int IDENTITY(1,1) NOT NULL,
	FullName nvarchar(250) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	Email nvarchar(400) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	PrimaryPhoneNumber nvarchar(50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	Password nvarchar(250) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	JobTitleId int NOT NULL,
	Specialization nvarchar(250) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	Certifications nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	CreatedBy uniqueidentifier DEFAULT '00000000-0000-0000-0000-000000000000' NOT NULL,
	CreatedOn datetime2 DEFAULT '0001-01-01T00:00:00.0000000' NOT NULL,
	DeletedBy uniqueidentifier NULL,
	DeletedOn datetime2 NULL,
	IsDeleted bit DEFAULT CONVERT([bit],(0)) NOT NULL,
	ModifiedBy uniqueidentifier NULL,
	ModifiedOn datetime2 NULL,
	IsAvailable bit DEFAULT CONVERT([bit],(1)) NOT NULL,
	CONSTRAINT PK_Technicians PRIMARY KEY (Id),
	CONSTRAINT FK_Technicians_JobTitles_JobTitleId FOREIGN KEY (JobTitleId) REFERENCES db_ab1bb9_salisautogms.dbo.JobTitles(Id)
);
 CREATE  UNIQUE NONCLUSTERED INDEX IX_Technicians_Email ON dbo.Technicians (  Email ASC  )  
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
 CREATE NONCLUSTERED INDEX IX_Technicians_JobTitleId ON dbo.Technicians (  JobTitleId ASC  )  
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
 CREATE  UNIQUE NONCLUSTERED INDEX IX_Technicians_PrimaryPhoneNumber ON dbo.Technicians (  PrimaryPhoneNumber ASC  )  
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;


-- db_ab1bb9_salisautogms.dbo.Users definition

-- Drop table

-- DROP TABLE db_ab1bb9_salisautogms.dbo.Users;

CREATE TABLE db_ab1bb9_salisautogms.dbo.Users (
	Id uniqueidentifier NOT NULL,
	FullName nvarchar(250) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	Email nvarchar(400) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	PhoneNumber nvarchar(50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	Password nvarchar(250) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	GenderId int NULL,
	CONSTRAINT PK_Users PRIMARY KEY (Id),
	CONSTRAINT FK_Users_Gender_GenderId FOREIGN KEY (GenderId) REFERENCES db_ab1bb9_salisautogms.dbo.Gender(Id)
);
 CREATE  UNIQUE NONCLUSTERED INDEX IX_Users_Email ON dbo.Users (  Email ASC  )  
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
 CREATE NONCLUSTERED INDEX IX_Users_GenderId ON dbo.Users (  GenderId ASC  )  
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
 CREATE  UNIQUE NONCLUSTERED INDEX IX_Users_PhoneNumber ON dbo.Users (  PhoneNumber ASC  )  
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;


-- db_ab1bb9_salisautogms.dbo.Appointments definition

-- Drop table

-- DROP TABLE db_ab1bb9_salisautogms.dbo.Appointments;

CREATE TABLE db_ab1bb9_salisautogms.dbo.Appointments (
	Id uniqueidentifier NOT NULL,
	CarId uniqueidentifier NOT NULL,
	AppointmentDate datetime2 NOT NULL,
	Status nvarchar(50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	Audiometer nvarchar(250) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	Notes nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	Schedule datetime2 NOT NULL,
	EstimateDuration time NULL,
	CustomerCarId uniqueidentifier NULL,
	CreatedBy uniqueidentifier DEFAULT '00000000-0000-0000-0000-000000000000' NOT NULL,
	CreatedOn datetime2 DEFAULT '0001-01-01T00:00:00.0000000' NOT NULL,
	DeletedBy uniqueidentifier NULL,
	DeletedOn datetime2 NULL,
	IsDeleted bit DEFAULT CONVERT([bit],(0)) NOT NULL,
	IsDraft bit DEFAULT CONVERT([bit],(0)) NOT NULL,
	ModifiedBy uniqueidentifier NULL,
	ModifiedOn datetime2 NULL,
	PriorityId int DEFAULT 0 NOT NULL,
	CONSTRAINT PK_Appointments PRIMARY KEY (Id),
	CONSTRAINT FK_Appointments_CustomerCars_CarId FOREIGN KEY (CarId) REFERENCES db_ab1bb9_salisautogms.dbo.CustomerCars(Id) ON DELETE CASCADE,
	CONSTRAINT FK_Appointments_CustomerCars_CustomerCarId FOREIGN KEY (CustomerCarId) REFERENCES db_ab1bb9_salisautogms.dbo.CustomerCars(Id),
	CONSTRAINT FK_Appointments_Priorities_PriorityId FOREIGN KEY (PriorityId) REFERENCES db_ab1bb9_salisautogms.dbo.Priorities(Id) ON DELETE CASCADE
);
 CREATE NONCLUSTERED INDEX IX_Appointments_CarId ON dbo.Appointments (  CarId ASC  )  
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
 CREATE NONCLUSTERED INDEX IX_Appointments_CustomerCarId ON dbo.Appointments (  CustomerCarId ASC  )  
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
 CREATE NONCLUSTERED INDEX IX_Appointments_PriorityId ON dbo.Appointments (  PriorityId ASC  )  
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;


-- db_ab1bb9_salisautogms.dbo.InventoryTransactions definition

-- Drop table

-- DROP TABLE db_ab1bb9_salisautogms.dbo.InventoryTransactions;

CREATE TABLE db_ab1bb9_salisautogms.dbo.InventoryTransactions (
	Id int IDENTITY(1,1) NOT NULL,
	InventoryId int NOT NULL,
	PartId int NOT NULL,
	InventoryTransactionTypeId int NOT NULL,
	Quantity int NOT NULL,
	CostPrice_Amount decimal(18,2) NOT NULL,
	CostPrice_Currency nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	VatRate decimal(5,2) NOT NULL,
	CreatedOn datetime2 NOT NULL,
	CreatedBy uniqueidentifier NOT NULL,
	ModifiedBy uniqueidentifier NULL,
	ModifiedOn datetime2 NULL,
	IsDeleted bit DEFAULT CONVERT([bit],(0)) NOT NULL,
	CONSTRAINT PK_InventoryTransactions PRIMARY KEY (Id),
	CONSTRAINT FK_InventoryTransactions_Inventories_InventoryId FOREIGN KEY (InventoryId) REFERENCES db_ab1bb9_salisautogms.dbo.Inventories(Id) ON DELETE CASCADE,
	CONSTRAINT FK_InventoryTransactions_InventoryTransactionTypes_InventoryTransactionTypeId FOREIGN KEY (InventoryTransactionTypeId) REFERENCES db_ab1bb9_salisautogms.dbo.InventoryTransactionTypes(Id),
	CONSTRAINT FK_InventoryTransactions_Parts_PartId FOREIGN KEY (PartId) REFERENCES db_ab1bb9_salisautogms.dbo.Parts(Id)
);
 CREATE NONCLUSTERED INDEX IX_InventoryTransactions_InventoryId ON dbo.InventoryTransactions (  InventoryId ASC  )  
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
 CREATE NONCLUSTERED INDEX IX_InventoryTransactions_InventoryTransactionTypeId ON dbo.InventoryTransactions (  InventoryTransactionTypeId ASC  )  
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
 CREATE NONCLUSTERED INDEX IX_InventoryTransactions_PartId ON dbo.InventoryTransactions (  PartId ASC  )  
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;


-- db_ab1bb9_salisautogms.dbo.PackageParts definition

-- Drop table

-- DROP TABLE db_ab1bb9_salisautogms.dbo.PackageParts;

CREATE TABLE db_ab1bb9_salisautogms.dbo.PackageParts (
	PackageId int NOT NULL,
	PartId int NOT NULL,
	Quantity int DEFAULT 0 NOT NULL,
	CONSTRAINT PK_PackageParts PRIMARY KEY (PackageId,PartId),
	CONSTRAINT FK_PackageParts_Packages_PackageId FOREIGN KEY (PackageId) REFERENCES db_ab1bb9_salisautogms.dbo.Packages(Id) ON DELETE CASCADE,
	CONSTRAINT FK_PackageParts_Parts_PartId FOREIGN KEY (PartId) REFERENCES db_ab1bb9_salisautogms.dbo.Parts(Id) ON DELETE CASCADE
);
 CREATE NONCLUSTERED INDEX IX_PackageParts_PartId ON dbo.PackageParts (  PartId ASC  )  
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;


-- db_ab1bb9_salisautogms.dbo.PackageServices definition

-- Drop table

-- DROP TABLE db_ab1bb9_salisautogms.dbo.PackageServices;

CREATE TABLE db_ab1bb9_salisautogms.dbo.PackageServices (
	PackageId int NOT NULL,
	ServiceId uniqueidentifier NOT NULL,
	Quantity int DEFAULT 0 NOT NULL,
	CONSTRAINT PK_PackageServices PRIMARY KEY (PackageId,ServiceId),
	CONSTRAINT FK_PackageServices_Packages_PackageId FOREIGN KEY (PackageId) REFERENCES db_ab1bb9_salisautogms.dbo.Packages(Id) ON DELETE CASCADE,
	CONSTRAINT FK_PackageServices_Services_ServiceId FOREIGN KEY (ServiceId) REFERENCES db_ab1bb9_salisautogms.dbo.Services(Id) ON DELETE CASCADE
);
 CREATE NONCLUSTERED INDEX IX_PackageServices_ServiceId ON dbo.PackageServices (  ServiceId ASC  )  
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;


-- db_ab1bb9_salisautogms.dbo.PurchaseOrderItems definition

-- Drop table

-- DROP TABLE db_ab1bb9_salisautogms.dbo.PurchaseOrderItems;

CREATE TABLE db_ab1bb9_salisautogms.dbo.PurchaseOrderItems (
	Id int IDENTITY(1,1) NOT NULL,
	PurchaseOrderId int NOT NULL,
	PartId int NOT NULL,
	Quantity int NOT NULL,
	CostPrice_Amount decimal(18,2) NOT NULL,
	CostPrice_Currency nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	VatRate decimal(18,2) NOT NULL,
	Total_Amount decimal(18,2) DEFAULT 0.0 NOT NULL,
	Total_Currency nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS DEFAULT N'' NOT NULL,
	SubTotal_Amount decimal(18,2) DEFAULT 0.0 NOT NULL,
	SubTotal_Currency nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS DEFAULT N'' NOT NULL,
	VatAmount_Amount decimal(18,2) DEFAULT 0.0 NOT NULL,
	VatAmount_Currency nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS DEFAULT N'' NOT NULL,
	CreatedBy uniqueidentifier DEFAULT '00000000-0000-0000-0000-000000000000' NOT NULL,
	CreatedOn datetime2 DEFAULT '0001-01-01T00:00:00.0000000' NOT NULL,
	DeletedBy uniqueidentifier NULL,
	DeletedOn datetime2 NULL,
	IsDeleted bit DEFAULT CONVERT([bit],(0)) NOT NULL,
	ModifiedBy uniqueidentifier NULL,
	ModifiedOn datetime2 NULL,
	CONSTRAINT PK_PurchaseOrderItems PRIMARY KEY (Id),
	CONSTRAINT FK_PurchaseOrderItems_Parts_PartId FOREIGN KEY (PartId) REFERENCES db_ab1bb9_salisautogms.dbo.Parts(Id),
	CONSTRAINT FK_PurchaseOrderItems_PurchaseOrders_PurchaseOrderId FOREIGN KEY (PurchaseOrderId) REFERENCES db_ab1bb9_salisautogms.dbo.PurchaseOrders(Id) ON DELETE CASCADE
);
 CREATE NONCLUSTERED INDEX IX_PurchaseOrderItems_PartId ON dbo.PurchaseOrderItems (  PartId ASC  )  
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
 CREATE NONCLUSTERED INDEX IX_PurchaseOrderItems_PurchaseOrderId ON dbo.PurchaseOrderItems (  PurchaseOrderId ASC  )  
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;


-- db_ab1bb9_salisautogms.dbo.PurchaseOrderStatusHistories definition

-- Drop table

-- DROP TABLE db_ab1bb9_salisautogms.dbo.PurchaseOrderStatusHistories;

CREATE TABLE db_ab1bb9_salisautogms.dbo.PurchaseOrderStatusHistories (
	Id int IDENTITY(1,1) NOT NULL,
	PurchaseOrderId int NOT NULL,
	Status int NOT NULL,
	ChangedOn datetime2 NOT NULL,
	ChangedBy uniqueidentifier NOT NULL,
	CONSTRAINT PK_PurchaseOrderStatusHistories PRIMARY KEY (Id),
	CONSTRAINT FK_PurchaseOrderStatusHistories_PurchaseOrders_PurchaseOrderId FOREIGN KEY (PurchaseOrderId) REFERENCES db_ab1bb9_salisautogms.dbo.PurchaseOrders(Id) ON DELETE CASCADE
);
 CREATE NONCLUSTERED INDEX IX_PurchaseOrderStatusHistories_PurchaseOrderId ON dbo.PurchaseOrderStatusHistories (  PurchaseOrderId ASC  )  
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;


-- db_ab1bb9_salisautogms.dbo.RoleUser definition

-- Drop table

-- DROP TABLE db_ab1bb9_salisautogms.dbo.RoleUser;

CREATE TABLE db_ab1bb9_salisautogms.dbo.RoleUser (
	RolesId int NOT NULL,
	UsersId uniqueidentifier NOT NULL,
	CONSTRAINT PK_RoleUser PRIMARY KEY (RolesId,UsersId),
	CONSTRAINT FK_RoleUser_Roles_RolesId FOREIGN KEY (RolesId) REFERENCES db_ab1bb9_salisautogms.dbo.Roles(Id) ON DELETE CASCADE,
	CONSTRAINT FK_RoleUser_Users_UsersId FOREIGN KEY (UsersId) REFERENCES db_ab1bb9_salisautogms.dbo.Users(Id) ON DELETE CASCADE
);
 CREATE NONCLUSTERED INDEX IX_RoleUser_UsersId ON dbo.RoleUser (  UsersId ASC  )  
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;


-- db_ab1bb9_salisautogms.dbo.ServiceParts definition

-- Drop table

-- DROP TABLE db_ab1bb9_salisautogms.dbo.ServiceParts;

CREATE TABLE db_ab1bb9_salisautogms.dbo.ServiceParts (
	ServiceId uniqueidentifier NOT NULL,
	PartId int NOT NULL,
	Quantity int NOT NULL,
	CONSTRAINT PK_ServiceParts PRIMARY KEY (ServiceId,PartId),
	CONSTRAINT FK_ServiceParts_Parts_PartId FOREIGN KEY (PartId) REFERENCES db_ab1bb9_salisautogms.dbo.Parts(Id) ON DELETE CASCADE,
	CONSTRAINT FK_ServiceParts_Services_ServiceId FOREIGN KEY (ServiceId) REFERENCES db_ab1bb9_salisautogms.dbo.Services(Id) ON DELETE CASCADE
);
 CREATE NONCLUSTERED INDEX IX_ServiceParts_PartId ON dbo.ServiceParts (  PartId ASC  )  
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;


-- db_ab1bb9_salisautogms.dbo.TechnicianAvailabilitySlot definition

-- Drop table

-- DROP TABLE db_ab1bb9_salisautogms.dbo.TechnicianAvailabilitySlot;

CREATE TABLE db_ab1bb9_salisautogms.dbo.TechnicianAvailabilitySlot (
	Id int IDENTITY(1,1) NOT NULL,
	TechnicianId int NOT NULL,
	[Day] int NOT NULL,
	StartTime time NOT NULL,
	EndTime time NOT NULL,
	IsAvailable bit NOT NULL,
	CONSTRAINT PK_TechnicianAvailabilitySlot PRIMARY KEY (Id),
	CONSTRAINT FK_TechnicianAvailabilitySlot_Technicians_TechnicianId FOREIGN KEY (TechnicianId) REFERENCES db_ab1bb9_salisautogms.dbo.Technicians(Id) ON DELETE CASCADE
);
 CREATE NONCLUSTERED INDEX IX_TechnicianAvailabilitySlot_TechnicianId ON dbo.TechnicianAvailabilitySlot (  TechnicianId ASC  )  
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;


-- db_ab1bb9_salisautogms.dbo.AppointmentImages definition

-- Drop table

-- DROP TABLE db_ab1bb9_salisautogms.dbo.AppointmentImages;

CREATE TABLE db_ab1bb9_salisautogms.dbo.AppointmentImages (
	Id uniqueidentifier NOT NULL,
	ImageId uniqueidentifier NOT NULL,
	AppointmentId uniqueidentifier NOT NULL,
	ImageUrl nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	CONSTRAINT PK_AppointmentImages PRIMARY KEY (Id),
	CONSTRAINT FK_AppointmentImages_Appointments_AppointmentId FOREIGN KEY (AppointmentId) REFERENCES db_ab1bb9_salisautogms.dbo.Appointments(Id) ON DELETE CASCADE
);
 CREATE NONCLUSTERED INDEX IX_AppointmentImages_AppointmentId ON dbo.AppointmentImages (  AppointmentId ASC  )  
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;


-- db_ab1bb9_salisautogms.dbo.AppointmentPackages definition

-- Drop table

-- DROP TABLE db_ab1bb9_salisautogms.dbo.AppointmentPackages;

CREATE TABLE db_ab1bb9_salisautogms.dbo.AppointmentPackages (
	AppointmentId uniqueidentifier NOT NULL,
	PackageId int NOT NULL,
	Id int NOT NULL,
	CONSTRAINT PK_AppointmentPackages PRIMARY KEY (AppointmentId,PackageId),
	CONSTRAINT FK_AppointmentPackages_Appointments_AppointmentId FOREIGN KEY (AppointmentId) REFERENCES db_ab1bb9_salisautogms.dbo.Appointments(Id) ON DELETE CASCADE,
	CONSTRAINT FK_AppointmentPackages_Packages_PackageId FOREIGN KEY (PackageId) REFERENCES db_ab1bb9_salisautogms.dbo.Packages(Id) ON DELETE CASCADE
);
 CREATE NONCLUSTERED INDEX IX_AppointmentPackages_PackageId ON dbo.AppointmentPackages (  PackageId ASC  )  
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;


-- db_ab1bb9_salisautogms.dbo.AppointmentServices definition

-- Drop table

-- DROP TABLE db_ab1bb9_salisautogms.dbo.AppointmentServices;

CREATE TABLE db_ab1bb9_salisautogms.dbo.AppointmentServices (
	AppointmentId uniqueidentifier NOT NULL,
	ServiceId uniqueidentifier NOT NULL,
	Id uniqueidentifier NOT NULL,
	CONSTRAINT PK_AppointmentServices PRIMARY KEY (AppointmentId,ServiceId),
	CONSTRAINT FK_AppointmentServices_Appointments_AppointmentId FOREIGN KEY (AppointmentId) REFERENCES db_ab1bb9_salisautogms.dbo.Appointments(Id) ON DELETE CASCADE,
	CONSTRAINT FK_AppointmentServices_Services_ServiceId FOREIGN KEY (ServiceId) REFERENCES db_ab1bb9_salisautogms.dbo.Services(Id) ON DELETE CASCADE
);
 CREATE NONCLUSTERED INDEX IX_AppointmentServices_ServiceId ON dbo.AppointmentServices (  ServiceId ASC  )  
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;