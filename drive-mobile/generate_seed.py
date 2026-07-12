import json
import random
import uuid
from datetime import datetime, timedelta

def random_date(start, end):
    return start + timedelta(
        seconds=random.randint(0, int((end - start).total_seconds()))
    )

def generate_seed():
    now = datetime.utcnow()
    past_30_days = now - timedelta(days=30)
    
    users = []
    profiles = []
    vehicles = []
    routes = []
    drives = []
    telemetry = []

    # 1. Generate 50 Users
    for i in range(50):
        uid = str(uuid.uuid4())
        users.append(uid)
        
        username = f"driver_{i}_{random.randint(1000, 9999)}"
        display_name = f"Driver {i}"
        
        profiles.append(f"('{uid}', '{username}', '{display_name}', 0, 0, 0, 'public', 'public', false, '{now.isoformat()}')")
        
        # 1-2 Vehicles per user
        for j in range(random.randint(1, 2)):
            vid = str(uuid.uuid4())
            make = random.choice(["Porsche", "BMW", "Audi", "Mercedes", "Toyota", "Honda", "Ford"])
            model = f"Model {j}"
            year = random.randint(2010, 2024)
            is_primary = 'true' if j == 0 else 'false'
            hp = random.randint(150, 600)
            
            vehicles.append(f"('{vid}', '{uid}', '{make}', '{model}', {year}, 'gasoline', {hp}, {is_primary}, 0, 0, '{now.isoformat()}')")
            
            # Generate 1-3 drives per vehicle
            for k in range(random.randint(1, 3)):
                did = str(uuid.uuid4())
                started_at = random_date(past_30_days, now)
                duration_s = random.randint(600, 3600) # 10m to 1h
                distance_m = random.randint(5000, 50000)
                ended_at = started_at + timedelta(seconds=duration_s)
                
                score_smoothness = random.uniform(60, 100)
                score_consistency = random.uniform(60, 100)
                score_comfort = random.uniform(60, 100)
                score_overall = (score_smoothness * 0.35) + (score_consistency * 0.35) + (score_comfort * 0.3)
                
                drives.append(f"('{did}', '{uid}', '{vid}', 'completed', '{started_at.isoformat()}', '{ended_at.isoformat()}', {duration_s}, {distance_m}, {score_smoothness}, {score_consistency}, {score_comfort}, {score_overall}, 'public')")

    # 2. Write to seed.sql
    with open("supabase/seed.sql", "w", encoding="utf-8") as f:
        f.write("-- Seed Data for DRIVE Mobile\\n\\n")
        
        # In Supabase, inserting to auth.users in seed.sql works if we provide the required fields
        f.write("-- Note: Insert to auth.users is complex in raw SQL without hashing passwords.\\n")
        f.write("-- We are bypassing auth.users and inserting directly to profiles for UI testing.\\n")
        f.write("-- (Assuming foreign key constraints might be deferred or we disable RLS for testing)\\n\\n")
        
        f.write("INSERT INTO profiles (id, username, display_name, total_drives, total_distance_m, total_duration_s, profile_visibility, drive_default_visibility, show_exact_start_end, created_at) VALUES\\n")
        f.write(",\\n".join(profiles) + ";\\n\\n")
        
        f.write("INSERT INTO vehicles (id, owner_id, make, model, year, engine_type, horsepower, is_primary, total_drives, total_distance_m, created_at) VALUES\\n")
        f.write(",\\n".join(vehicles) + ";\\n\\n")
        
        f.write("INSERT INTO drives (id, user_id, vehicle_id, status, started_at, ended_at, duration_s, distance_m, score_smoothness, score_consistency, score_comfort, score_overall, visibility) VALUES\\n")
        f.write(",\\n".join(drives) + ";\\n\\n")

    print("Created: supabase/seed.sql")

if __name__ == '__main__':
    generate_seed()
