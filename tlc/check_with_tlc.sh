# Resolve the script's directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Source the common script using absolute path
source "$SCRIPT_DIR/common.sh" || { echo "Error: Could not load common.sh"; exit 1; }

# Default configurations
APALACHE_JAR="$HOME/.quint/apalache-dist-0.47.2/apalache/lib/apalache.jar"
JAVA_OPTS="-Xmx8G -Xss515m"

FILE=""  # Mandatory: User must specify a file
MAIN=""  # Optional: Main module name
INIT="init"  # Default initializer action
STEP="step"  # Default step action
INVARIANT="true"  # Default invariant
TEMPORAL=""  # Default temporal properties
WORKERS="auto"  # Default number of workers for TLC

# Function to parse command-line arguments
parse_args() {
    # First argument is the input file (positional)
    if [[ $# -gt 0 ]] && [[ "$1" != --* ]]; then
        FILE="$1"
        shift
    fi

    while [[ $# -gt 0 ]]; do
        case "$1" in
            --invariant)
                shift
                INVARIANT="$1"
                ;;
            --temporal)
                shift
                TEMPORAL="$1"
                ;;
            --main)
                shift
                MAIN="$1"
                ;;
            --init)
                shift
                INIT="$1"
                ;;
            --step)
                shift
                STEP="$1"
                ;;
            --apalache-jar)
                shift
                APALACHE_JAR="$1"
                ;;
            --workers)
                shift
                WORKERS="$1"
                ;;
            --help)
                echo "Usage: $0 <input> [options]"
                echo ""
                echo "Options:"
                echo "  --help         Show help"
                echo "  --main         name of the main module (by default, computed from filename)"
                echo "  --init         name of the initializer action [default: \"init\"]"
                echo "  --step         name of the step action [default: \"step\"]"
                echo "  --invariant    invariant to check: a definition name or an expression [default: \"true\"]"
                echo "  --temporal     the temporal properties to check, separated by commas"
                echo "  --workers      number of workers for TLC [default: auto]"
                exit 0
                ;;
            *)
                err "Unknown option: $1"
                exit 1
                ;;
        esac
        shift
    done

    # Ensure exactly one file is provided
    if [[ -z "$FILE" ]]; then
        err_and_exit "You must specify a Quint file as the first argument"
    fi
}

# Function to generate the compilation arguments dynamically
generate_compile_options() {
    local options=()

    if [[ -n "$MAIN" ]]; then
        options+=("--main=$MAIN")
    fi

    options+=("--init=$INIT")
    options+=("--step=$STEP")
    options+=("--invariant=$INVARIANT")

    if [[ -n "$TEMPORAL" ]]; then
        options+=("--temporal=$TEMPORAL")
    fi

    echo "${options[*]}"
}

# Function to determine the base name for output files
get_output_base_name() {
    if [[ -n "$MAIN" ]]; then
        echo "$MAIN"
    else
        local base_name="${FILE%.qnt}"
        echo "$base_name"
    fi
}

# Function to create a standard .cfg file
create_cfg_file() {
    local cfg_file="$1"
    echo "INIT" > "$cfg_file"
    echo "q_init" >> "$cfg_file"
    echo "" >> "$cfg_file"
    echo "NEXT" >> "$cfg_file"
    echo "q_step" >> "$cfg_file"

    # Add default invariant if invariants were specified and not "true"
    if [[ "$INVARIANT" != "true" ]]; then
        echo "" >> "$cfg_file"
        echo "INVARIANT" >> "$cfg_file"
        echo "q_inv" >> "$cfg_file"
    fi

    # Add default temporal properties if any were specified
    if [[ -n "$TEMPORAL" ]]; then
        echo "" >> "$cfg_file"
        echo "PROPERTY" >> "$cfg_file"
        echo "q_temporalProps" >> "$cfg_file"
    fi
}

# Function to run TLC model checker with real-time output
run_tlc() {
    local tla_file="$1"
    local output_file
    output_file=$(mktemp)  # Create a temporary file to store output

    info "Running TLC for $tla_file..."

    # Run TLC, writing to both stdout and the temp file
    if ! java $JAVA_OPTS -cp "$APALACHE_JAR" tlc2.TLC -deadlock -workers "$WORKERS" "$tla_file" 2>&1 | tee "$output_file"; then
        err_and_exit "TLC execution failed for $tla_file"
    fi

    # Check the saved output for success message
    if grep -q "Model checking completed. No error has been found." "$output_file"; then
        info "Model checking succeeded for $tla_file"
        rm "$output_file"  # Clean up temp file
    else
        err_and_exit "Model checking failed for $tla_file\n$(cat "$output_file")"
    fi
}

# Main function to process the file
process_file() {
    local base_name=$(get_output_base_name)
    local tla_file="${base_name}.tla"
    local cfg_file="${base_name}.cfg"

    info "Processing $FILE..."

    # Step 1: Compile the .qnt file to .tla
    local compile_options
    compile_options=$(generate_compile_options)
    quint compile --target=tlaplus "$FILE" $compile_options > "$tla_file" || err_and_exit "Compilation failed for $FILE"

    # Step 2: Create .cfg file with `q_inv` and `q_temporalProps`
    create_cfg_file "$cfg_file"

    # Step 3: Run model checker
    run_tlc "$tla_file"

    # Step 4: Cleanup
    rm -f "$tla_file" "$cfg_file"
}

# Parse command-line arguments
parse_args "$@"

# Process the single file
process_file

info "File processed successfully."
