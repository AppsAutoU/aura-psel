#!/usr/bin/env python3
import psycopg2

# Conexão com Supabase PostgreSQL
conn_string = "host=aws-0-sa-east-1.pooler.supabase.com port=6543 dbname=postgres user=postgres.zbsjjafbrwloedtkwfjl password=sua_senha_postgres"

try:
    print("🔧 Connecting to database...")
    conn = psycopg2.connect(conn_string)
    cur = conn.cursor()

    print("🔧 Adding nivel_ingles column...")
    cur.execute("""
        ALTER TABLE aura_jobs_candidatos
        ADD COLUMN IF NOT EXISTS nivel_ingles TEXT;
    """)

    print("📝 Adding column comment...")
    cur.execute("""
        COMMENT ON COLUMN aura_jobs_candidatos.nivel_ingles IS
        'Nível de inglês do candidato (Básico, Intermediário, Avançado, Fluente, Nativo)';
    """)

    conn.commit()
    print("✅ Column 'nivel_ingles' added successfully!")

except Exception as e:
    print(f"❌ Error: {e}")
    print("\n📝 Please run this SQL manually in Supabase dashboard:")
    print("ALTER TABLE aura_jobs_candidatos ADD COLUMN IF NOT EXISTS nivel_ingles TEXT;")
finally:
    if conn:
        cur.close()
        conn.close()
        print("🔌 Connection closed.")
