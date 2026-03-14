-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Employers table
CREATE TABLE employers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    company_name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Documents table
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employer_id UUID REFERENCES employers(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    storage_url TEXT NOT NULL,
    extracted_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Document chunks for semantic search
CREATE TABLE document_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    chunk_text TEXT NOT NULL,
    embedding vector(1536),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Training modules table
CREATE TABLE training_modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    topics JSONB NOT NULL,
    slides JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quizzes table
CREATE TABLE quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    training_module_id UUID REFERENCES training_modules(id) ON DELETE CASCADE,
    questions JSONB NOT NULL
);

-- Volunteers table
CREATE TABLE volunteers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quiz attempts table
CREATE TABLE quiz_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    volunteer_id UUID REFERENCES volunteers(id) ON DELETE CASCADE,
    quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
    answers JSONB NOT NULL,
    score INT NOT NULL,
    passed BOOLEAN NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Passports table
CREATE TABLE passports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    volunteer_id UUID REFERENCES volunteers(id) ON DELETE CASCADE,
    training_module_id UUID REFERENCES training_modules(id) ON DELETE CASCADE,
    readiness_score INT NOT NULL,
    xp INT NOT NULL,
    status TEXT NOT NULL,
    score INT DEFAULT 0,
    breakdown JSONB DEFAULT '{}',
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_document_chunks_document_id ON document_chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_document_chunks_embedding ON document_chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX IF NOT EXISTS idx_passports_volunteer_id ON passports(volunteer_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_volunteer_id ON quiz_attempts(volunteer_id);

-- Similarity search RPC for pgvector
CREATE OR REPLACE FUNCTION similarity_search(
    query_embedding vector(1536),
    document_id UUID,
    top_k INT DEFAULT 5
)
RETURNS TABLE(chunk_text TEXT, similarity FLOAT)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        dc.chunk_text,
        1 - (dc.embedding <=> query_embedding) AS similarity
    FROM document_chunks dc
    WHERE dc.document_id = similarity_search.document_id
    ORDER BY dc.embedding <=> query_embedding
    LIMIT top_k;
END;
$$;