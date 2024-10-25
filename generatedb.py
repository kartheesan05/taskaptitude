import random
import psycopg2
from faker import Faker

# Initialize Faker
fake = Faker()

# Database connection
connection = psycopg2.connect(
    dbname="taskaptitude",
    user="jerryadmin",
    password="sedlifedes",
    host="192.168.1.10",
    port="5432"
)
cursor = connection.cursor()

# Insert 200 random questions into the dep_questions table
for _ in range(300):
    question = fake.sentence(nb_words=10)  # Generate a random question
    options = [fake.word() for _ in range(4)]  # Generate four random options
    # Randomly select the correct answer index
    correct_index = random.randint(0, 3)
    # Convert index to 'a', 'b', 'c', or 'd'
    correct_answer = chr(97 + correct_index)

    # Insert question and answers into the database
    cursor.execute(
        """
        INSERT INTO aptitude_questions (question, option_a, option_b, option_c, option_d, correct_answer)
        VALUES (%s, %s, %s, %s, %s, %s)
        """,
        (question, options[0], options[1],
         options[2], options[3], correct_answer)
    )

# Commit and close the connection
connection.commit()
cursor.close()
connection.close()

print("300 questions inserted successfully.")
