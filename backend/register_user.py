import csv
import os

USER_FILE = 'user_details.csv'

def register_user(name: str, email: str, phone: str, user_id: str) -> None:
    # Create CSV file with header if not present
    
    if not os.path.exists(USER_FILE):
        with open(USER_FILE, mode='w', newline='') as file:
            writer = csv.writer(file)
            writer.writerow(['name', 'email', 'phone', 'user_id'])

    # Check for existing user_id
    with open(USER_FILE, mode='r', newline='') as file:
        reader = csv.DictReader(file)
        for row in reader:
            if row['user_id'] == user_id:
                print(f"❌ User ID '{user_id}' already exists. Registration failed.")
                return

    # Append new user details
    with open(USER_FILE, mode='a', newline='') as file:
        writer = csv.writer(file)
        writer.writerow([name, email, phone, user_id])

    print(f"✅ User '{name}' registered successfully.")

# Example usage
if __name__ == "__main__":
    register_user("John Doe", "john@example.com", "9876543210", "W005")
