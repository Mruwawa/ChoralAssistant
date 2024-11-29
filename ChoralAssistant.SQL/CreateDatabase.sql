IF NOT EXISTS (SELECT 1
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_NAME = 'Pieces' AND TABLE_SCHEMA = 'dbo')
BEGIN
    CREATE TABLE Pieces
    (
        [PieceId] INT NOT NULL PRIMARY KEY IDENTITY(1, 1),
        [Title] VARCHAR(255),
        [Description] VARCHAR(4096),
        [AudioUrl] VARCHAR(255),
        [ThumbnailUrl] VARCHAR(255),
        [OwnerUserGuid] VARCHAR(255),
        [StorageFolderGuid] VARCHAR(255),
        [PageCount] INT,
        [Type] VARCHAR(255)
    )
END

IF NOT EXISTS (SELECT 1
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_NAME = 'RecentPieces' AND TABLE_SCHEMA = 'dbo')
BEGIN
    CREATE TABLE RecentPieces
    (
        [RecentPieceId] INT NOT NULL PRIMARY KEY IDENTITY(1, 1),
        [PieceId] INT NOT NULL,
        [LastAccessed] DATETIME NOT NULL
        CONSTRAINT FK_RecentPieces_Pieces FOREIGN KEY (PieceId)
        REFERENCES Pieces (PieceId)
        ON DELETE CASCADE
    )
END