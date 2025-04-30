DELIMITER //

DROP PROCEDURE IF EXISTS GetCounts;
CREATE PROCEDURE GetCounts(
    IN columnName VARCHAR(50),
    IN nameValue VARCHAR(255),
    IN ageValue VARCHAR(255),
    IN gradeValue VARCHAR(255),
    IN gpaValue VARCHAR(255),
    IN majorValue VARCHAR(255),
    IN genderValue VARCHAR(255)
)
BEGIN
    DECLARE sql_query TEXT;
   
    -- Create temporary table
    CREATE TEMPORARY TABLE TempSummaryResults (
        category VARCHAR(255),
        result FLOAT
    );

    -- Construct dynamic SQL
    SET @sql_query = CONCAT(
         'INSERT INTO TempSummaryResults ',
        'SELECT ', columnName, ', COUNT(*) ',
        'FROM classes.students ',
        'WHERE ', nameValue, ' ',
        'AND ', ageValue, ' ',
        'AND ', gradeValue, ' ',
        'AND ', gpaValue, ' ',
        'AND ', majorValue, ' ',
        'AND ', genderValue, ' ',
        'GROUP BY ', columnName
    );

    -- Prepare, execute, and deallocate the statement
    PREPARE stmt FROM @sql_query;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;

    -- Return results
    SELECT * FROM TempSummaryResults;

    -- Drop temporary table
    DROP TEMPORARY TABLE TempSummaryResults;
END;
//

DELIMITER ;