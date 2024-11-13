import psycopg2
import pandas as pd
import ast
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
cursor.execute("TRUNCATE TABLE dep_questions RESTART IDENTITY")

# Read the CSV file
df = pd.read_csv('./dep_questions.csv')

# Process each row
for index, row in df.iterrows():
    try:
        choices_str = row['choices']
        
        # Find the text array which comes after 'text': array([
        texts_start = choices_str.find("'text': array([") + 14
        texts_end = choices_str.rfind(']')
        texts_str = choices_str[texts_start:texts_end]
        
        # Split and clean the text values
        texts = [t.strip("' []") for t in texts_str.split(',')]
        texts = [t.strip() for t in texts if t.strip()][:4]  # Get only first 4 options
        
        # Create options dictionary with A, B, C, D keys
        options = {
            'A': texts[0],
            'B': texts[1],
            'C': texts[2],
            'D': texts[3]
        }
        
        # Get the correct answer
        correct_answer = row['answerKey'].lower()
        
        # If correct answer is 'e', randomly reassign it to a, b, c, or d
        if correct_answer == 'e':
            new_correct = random.choice(['a', 'b', 'c', 'd'])
            correct_answer = new_correct

        # Insert into database
        cursor.execute("""
            INSERT INTO dep_questions (question, option_a, option_b, option_c, option_d, correct_answer)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (
            row['question'],
            options['A'],
            options['B'],
            options['C'],
            options['D'],
            correct_answer
        ))

    except Exception as e:
        print(f"Error processing row {index}: {e}")
        print(f"Raw data: {row['choices']}")

# Commit the changes and close the connection
connection.commit()
cursor.close()
connection.close()