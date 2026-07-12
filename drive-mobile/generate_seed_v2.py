import random
import uuid
from datetime import datetime, timedelta

def random_date(start, end):
    return start + timedelta(seconds=random.randint(0, int((end - start).total_seconds())))

def generate_seed():
    now = datetime.utcnow()
    past_30_days = now - timedelta(days=30)
    
    users = []
    profiles = []
    vehicles = []
    routes = []
    drives = []

    # Route definitions (Real world approximations)
    predefined_routes = [
        {"name": "Pacific Coast Highway", "diff": "moderate", "road": "coastal", "len": 45000, "coords": [(-122.5, 37.8), (-122.4, 37.7), (-122.5, 37.6)]},
        {"name": "Angeles Crest Highway", "diff": "challenging", "road": "mountain", "len": 60000, "coords": [(-118.2, 34.2), (-118.1, 34.3), (-117.9, 34.3)]},
        {"name": "Tail of the Dragon", "diff": "expert", "road": "mountain", "len": 17000, "coords": [(-83.9, 35.5), (-83.9, 35.4), (-84.0, 35.4)]},
        {"name": "Amalfi Coast Road", "diff": "moderate", "road": "coastal", "len": 50000, "coords": [(14.6, 40.6), (14.5, 40.6), (14.4, 40.6)]},
        {"name": "Nürburgring Nordschleife (Tourist)", "diff": "expert", "road": "mixed", "len": 20800, "coords": [(6.9, 50.3), (6.9, 50.4), (7.0, 50.4)]}
    ]

    for i in range(50):
        uid = str(uuid.uuid4())
        users.append(uid)
        
        username = f"driver_{i}_{random.randint(1000, 9999)}"
        display_name = f"Driver {i}"
        
        profiles.append(f"('{uid}', '{username}', '{display_name}', 0, 0, 0, 'public', 'public', false, '{now.isoformat()}')")
        
        # Vehicles
        for j in range(random.randint(1, 2)):
            vid = str(uuid.uuid4())
            make = random.choice(["Porsche", "BMW", "Audi", "Mercedes", "Toyota", "Honda", "Ford"])
            model = f"Model {j}"
            year = random.randint(2010, 2024)
            is_primary = 'true' if j == 0 else 'false'
            hp = random.randint(150, 600)
            vehicles.append(f"('{vid}', '{uid}', '{make}', '{model}', {year}, 'gasoline', {hp}, {is_primary}, 0, 0, '{now.isoformat()}')")
            
            # Drives
            for k in range(random.randint(1, 3)):
                did = str(uuid.uuid4())
                started_at = random_date(past_30_days, now)
                duration_s = random.randint(600, 3600)
                distance_m = random.randint(5000, 50000)
                ended_at = started_at + timedelta(seconds=duration_s)
                
                s_smooth = random.uniform(60, 100)
                s_consist = random.uniform(60, 100)
                s_comfort = random.uniform(60, 100)
                s_over = (s_smooth * 0.35) + (s_consist * 0.35) + (s_comfort * 0.3)
                
                drives.append(f"('{did}', '{uid}', '{vid}', 'completed', '{started_at.isoformat()}', '{ended_at.isoformat()}', {duration_s}, {distance_m}, {s_smooth}, {s_consist}, {s_comfort}, {s_over}, 'public')")

    # Generate 10 Real Routes
    for _ in range(10):
        rid = str(uuid.uuid4())
        creator_id = random.choice(users)
        rt = random.choice(predefined_routes)
        
        # Format LineString
        ls_points = ",".join([f"{lon} {lat}" for lon, lat in rt["coords"]])
        route_line = f"SRID=4326;LINESTRING({ls_points})"
        start_point = f"SRID=4326;POINT({rt['coords'][0][0]} {rt['coords'][0][1]})"
        
        routes.append(f"('{rid}', '{creator_id}', '{rt['name']} - {random.randint(1,100)}', '{route_line}', '{start_point}', {rt['len']}, '{rt['diff']}', '{rt['road']}', {random.uniform(4.0, 5.0)}, 100, 50, 20, 'public', '{now.isoformat()}')")

    with open("supabase/seed.sql", "w", encoding="utf-8") as f:
        f.write("-- Seed Data v2 for DRIVE Mobile (PostGIS routes included)\\n\\n")
        f.write("INSERT INTO profiles (id, username, display_name, total_drives, total_distance_m, total_duration_s, profile_visibility, drive_default_visibility, show_exact_start_end, created_at) VALUES\\n")
        f.write(",\\n".join(profiles) + ";\\n\\n")
        
        f.write("INSERT INTO vehicles (id, owner_id, make, model, year, engine_type, horsepower, is_primary, total_drives, total_distance_m, created_at) VALUES\\n")
        f.write(",\\n".join(vehicles) + ";\\n\\n")

        f.write("INSERT INTO routes (id, creator_id, name, route_line, start_point, distance_m, difficulty, road_type, avg_rating, review_count, drive_count, save_count, visibility, created_at) VALUES\\n")
        f.write(",\\n".join(routes) + ";\\n\\n")
        
        f.write("INSERT INTO drives (id, user_id, vehicle_id, status, started_at, ended_at, duration_s, distance_m, score_smoothness, score_consistency, score_comfort, score_overall, visibility) VALUES\\n")
        f.write(",\\n".join(drives) + ";\\n\\n")

    print("Created: supabase/seed.sql")

if __name__ == '__main__':
    generate_seed()
