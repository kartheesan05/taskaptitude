import psycopg2
import pandas as pd
import random

# Database connection
connection = psycopg2.connect(
    dbname="taskaptitude",
    user="jerryadmin",
    password="sedlifedes",
    host="192.168.1.10",
    port="5432"
)

cursor = connection.cursor()

# Clear existing records
cursor.execute("TRUNCATE TABLE aptitude_questions RESTART IDENTITY")

# Read the CSV file
df = pd.read_csv('./apt_questions.csv')

# Process each row
for index, row in df.iterrows():
    try:
        # Map the numeric answer (1,2,3,4) to letter (a,b,c,d)
        answer_map = {1: 'a', 2: 'b', 3: 'c', 4: 'd'}
        correct_answer = answer_map[row['OptionAns']]

        # Insert into database
        cursor.execute("""
            INSERT INTO aptitude_questions (
                question, 
                option_a, 
                option_b, 
                option_c, 
                option_d, 
                correct_answer
            )
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (
            row['QuesText'],
            row['OptionA'],
            row['OptionB'],
            row['OptionC'],
            row['OptionD'],
            correct_answer
        ))

    except Exception as e:
        print(f"Error processing row {index}: {e}")
        print(f"Raw data: {row}")

# Commit the changes and close the connection
connection.commit()
cursor.close()
connection.close()