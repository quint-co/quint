#!/bin/bash

# Load common utilities
source ./common.sh || { echo "Error: Could not load common.sh"; exit 1; }

# Default configurations
APALACHE_JAR="$HOME/.quint/apalache-dist-0.47.2/apalache/lib/apalache.jar"
JAVA_OPTS="-Xmx8G -Xss515m"
FILE=""  # Mandatory: User must specify a file

# Optional parameters
INVARIANTS=()
TEMPORAL_PROPS=()

# Function to parse command-line arguments
parse_args() {
    while [[ $# -gt 0 ]]; do
        case "$1" in
            --invariant)
                shift
                IFS=',' read -ra INVARIANTS <<< "$1"
                ;;
            --temporal)
                shift
                IFS=',' read -ra TEMPORAL_PROPS <<< "$1"
                ;;
            --file)
                shift
                FILE="$1"
                ;;
            --apalache-jar)
                shift
                APALACHE_JAR="$1"
                ;;
            --help)
                echo "Usage: $0 --file FILE.qnt [--invariant INV1,INV2] [--temporal TEMP1,TEMP2] [--apalache-jar JAR_PATH]"
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
        err_and_exit "You must specify a Quint file using --file FILE.qnt"
    fi
}

# Function to generate the compilation arguments dynamically
generate_compile_options() {
    local options=()
    if [[ ${#INVARIANTS[@]} -gt 0 ]]; then
        options+=("--invariant=$(IFS=,; echo "${INVARIANTS[*]}")")
    fi
    if [[ ${#TEMPORAL_PROPS[@]} -gt 0 ]]; then
        options+=("--temporal=$(IFS=,; echo "${TEMPORAL_PROPS[*]}")")
    fi
    echo "${options[*]}"
}

# Function to create a standard .cfg file
create_cfg_file() {
    local cfg_file="$1"
    echo "INIT" > "$cfg_file"
    echo "q_init" >> "$cfg_file"
    echo "" >> "$cfg_file"
    echo "NEXT" >> "$cfg_file"
    echo "q_step" >> "$cfg_file"

    # Add default invariant if invariants were specified
    if [[ ${#INVARIANTS[@]} -gt 0 ]]; then
        echo "" >> "$cfg_file"
        echo "INVARIANT" >> "$cfg_file"
        echo "q_inv" >> "$cfg_file"
    fi

    # Add default temporal properties if any were specified
    if [[ ${#TEMPORAL_PROPS[@]} -gt 0 ]]; then
        echo "" >> "$cfg_file"
        echo "PROPERTY" >> "$cfg_file"
        echo "q_temporalProps" >> "$cfg_file"
    fi
}

# Function to run TLC model checker
run_tlc() {
    local tla_file="$1"
    local output

    info "Running TLC for $tla_file..."
    output=$(java $JAVA_OPTS -cp "$APALACHE_JAR" tlc2.TLC -deadlock "$tla_file" 2>&1)

    if echo "$output" | grep -q "Model checking completed. No error has been found."; then
        info "Model checking succeeded for $tla_file"
    else
        err_and_exit "Model checking failed for $tla_file\n$output"
    fi
}

# Main function to process the file
process_file() {
    local base_name="${FILE%.qnt}"
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
