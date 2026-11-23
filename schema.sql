CREATE TABLE IF NOT EXISTS records (
    id SERIAL PRIMARY KEY,
    title VARCHAR(80) NOT NULL,
    category VARCHAR(40) NOT NULL,
    description VARCHAR(300) NOT NULL,
    status VARCHAR(20) NOT NULL,

    CONSTRAINT valid_title
        CHECK (LENGTH(TRIM(title)) >= 3),

    CONSTRAINT valid_category
        CHECK (LENGTH(TRIM(category)) >= 2),

    CONSTRAINT valid_description
        CHECK (LENGTH(TRIM(description)) >= 5),

    CONSTRAINT valid_status
        CHECK (status IN ('Pending', 'In progress', 'Completed'))              
);