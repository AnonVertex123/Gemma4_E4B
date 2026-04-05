#!/bin/bash
# ============================================================
# TỰ MINH AGI - BLUEPRINT SYSTEM SETUP
# Quick setup script cho Blueprint System
# ============================================================

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║     TỰ MINH AGI - BLUEPRINT SYSTEM SETUP                 ║"
echo "║   'Tâm là gốc, Trí là hoa, Tiến hóa là quả'             ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Check Python version
echo "🔍 Checking Python version..."
python_version=$(python --version 2>&1 | awk '{print $2}')
echo "   Python version: $python_version"

if ! command -v python &> /dev/null; then
    echo "❌ Python not found! Please install Python 3.8+"
    exit 1
fi

# Create virtual environment (optional)
echo ""
read -p "📦 Create virtual environment? (y/n): " create_venv

if [ "$create_venv" = "y" ]; then
    echo "   Creating venv..."
    python -m venv venv_tuminh
    source venv_tuminh/bin/activate
    echo "   ✅ Virtual environment activated"
fi

# Install dependencies
echo ""
echo "📥 Installing dependencies..."
pip install -r requirements.txt

if [ $? -eq 0 ]; then
    echo "   ✅ Dependencies installed"
else
    echo "   ❌ Failed to install dependencies"
    exit 1
fi

# Check Ollama
echo ""
echo "🔍 Checking Ollama..."
if command -v ollama &> /dev/null; then
    echo "   ✅ Ollama found"
    
    # Check if TuminhAGI_G4 model exists
    if ollama list | grep -q "TuminhAGI_G4"; then
        echo "   ✅ TuminhAGI_G4 model exists"
    else
        echo "   ⚠️  TuminhAGI_G4 model not found"
        read -p "   Create model now? (y/n): " create_model
        
        if [ "$create_model" = "y" ]; then
            if [ -f "Tuminh_G4.modelfile" ]; then
                ollama create TuminhAGI_G4 -f Tuminh_G4.modelfile
                echo "   ✅ Model created"
            else
                echo "   ❌ Tuminh_G4.modelfile not found"
                echo "   Please create modelfile first"
            fi
        fi
    fi
else
    echo "   ❌ Ollama not found"
    echo "   Install from: https://ollama.com"
fi

# Create necessary directories
echo ""
echo "📁 Creating directories..."
mkdir -p logs
mkdir -p chroma_db
echo "   ✅ Directories created"

# Make CLI executable
echo ""
echo "🔧 Setting up CLI..."
chmod +x tuminh_cli.py
echo "   ✅ CLI ready"

# Run tests
echo ""
read -p "🧪 Run tests now? (y/n): " run_tests

if [ "$run_tests" = "y" ]; then
    echo "   Running tests..."
    python test_blueprint.py
fi

# Summary
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "✅ SETUP COMPLETE!"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "📝 Quick start commands:"
echo "   python tuminh_cli.py list              # List workflows"
echo "   python tuminh_cli.py show smart_qa     # Show workflow"
echo "   python tuminh_cli.py query 'question'  # Quick query"
echo ""
echo "📚 Read README.md for detailed documentation"
echo ""
echo "🐉 Happy coding with Tự Minh AGI!"
echo "═══════════════════════════════════════════════════════════"
