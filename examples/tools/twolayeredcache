// -*- mode: Bluespec; -*-

 /** 
  * Quint specification for a two-layered cache system. The system consists of
  * two cache layers (L1 and L2) that store integer values. Clients can read and
  * write values to the cache. The specification verifies key properties like
  * read-after-write consistency and write-after-write consistency across the
  * cache layers.
  * 
  * Preston Pham (@mt40), 2025
  */ 

module two_layered_cache {
    //**********************************************************
    // TYPE DEFINITIONS
    //**********************************************************
    type CacheLayer = Set[int] // use Set so it is easy to extend to multiple keys if needed
    type ClientPID = int

    type HistoryEntry = Read(int) | Write(int)

    //**********************************************************
    // CONSTANTS
    //**********************************************************
    pure val DefaultExpireDuration = 3
    pure val ClientProcesses: Set[ClientPID] = 1.to(10)
    pure val MaxVal = 1000000
    pure val Expired = -99
    pure val NotFound = -98

    //**********************************************************
    // STATE MACHINE
    // State-dependent definitions and actions
    //**********************************************************

    var l1: CacheLayer
    var l2: CacheLayer
    var num: int

    // Global log of system events. Use to specify correctness
    // properties below.
    var history: List[HistoryEntry]

    //**********************************************************
    // FUNCTIONAL LAYER
    // Values and functions that are state-independent
    //**********************************************************

    pure def isWrite(entry: HistoryEntry): bool = {
        match entry {
            | Write(_) => true
            | _ => false
        }
    }

    pure def isRead(entry: HistoryEntry): bool = {
        match entry {
            | Read(_) => true
            | _ => false
        }
    }

    pure def value(entry: HistoryEntry): int = {
        match entry {
            | Read(v) => v
            | Write(v) => v
        }
    }

    // Get the first element of a given non-empty Set
    pure def getHeadOfSet(s: Set[int]): int = {
        s.fold(0, (a, b) => b)
    }

    //**********************************************************
    // HELPERS
    // Operators for convenience
    //**********************************************************

    action writeL1(v: int): bool = all {
        l1' = Set(v)
    }

    action writeL2(v: int): bool = all {
        l2' = Set(v)
    }

    //**********************************************************
    // ACTIONS
    //**********************************************************

    action writeCache(pid: ClientPID, v: int): bool = all {
        writeL1(v),
        writeL2(v),
        history' = history.append(Write(v))
    }

    action handleNotFound(): bool = all {
        l1' = l1,
        l2' = l2,
        history' = history.append(Read(NotFound))
    }

    action handleL1Found(): bool = {
        val value = getHeadOfSet(l1)
        all {
            l1' = l1,
            l2' = l2,
            history' = history.append(Read(value))
        }
    }

    action handleL2Found(): bool = {
        val value = getHeadOfSet(l2)
        all {
            writeL1(value),
            l2' = l2,
            history' = history.append(Read(value))
        }
    }

    action handleFound(): bool = {
        if (l1.size() > 0) {
            handleL1Found
        } else {
            handleL2Found
        }
    }

    // If val doesn't exist in L1, read from L2.
    // If val exists in L2, write back to L1 then return.
    // Otherwise, not found (false).
    action readCache(pid: ClientPID): bool = {
        if (l1.size() > 0 or l2.size() > 0) {
            handleFound
        } else {
            handleNotFound
        }
    }

    action clientProc = all {
        nondet pid = ClientProcesses.oneOf()
        
        any {
            all {
                num' = num + 1,
                writeCache(pid, num)
            },
            all {
                num' = num,
                readCache(pid),
            }
        },
    }

    // Clear layer 1 data to simulate its
    // volatility. Because in practice, layer 1
    // usually uses memory for storage.
    action l1Expire = all {
        any {
            l1' = l1,
            l1' = Set()
        },
        l2' = l2,
        num' = num,
        history' = history
    }

    action stutter = all {
        num' = num,
        l1' = l1,
        l2' = l2,
        history' = history,
    }

    action init = all {
        num' = 0,
        l1' = Set(),
        l2' = Set(),
        history' = [],
    }

    action step = any {
        clientProc,
        stutter,
        l1Expire
    }

    //**********************************************************
    // CORRECTNESS
    // 1. Safety Properties / Invariants
    //**********************************************************

    // Read the latest write
    val readAfterWrite: bool = {
        val idx = history.indices()
        idx.forall(i => {
            idx.forall(j => {
                i < j
                and history[i].isWrite()
                and history[j].isRead()
                implies history[i].value() <= history[j].value()
            })
        })
    }

    // Later write must contain a greater value
    val writeAfterWrite: bool = {
        val idx = history.indices()
        idx.forall(i => {
            idx.forall(j => {
                i < j
                and history[i].isWrite()
                and history[j].isWrite()
                implies history[i].value() < history[j].value()
            })
        })
    }

    //**********************************************************
    // CORRECTNESS
    // 2. Liveness Properties / Temporal
    //**********************************************************

    // All layers contain the same latest written value
    val agreement: bool = {
        val a = getHeadOfSet(l1)
        val b = getHeadOfSet(l2)
        a == b
    }

    //**********************************************************
    // QUICK TESTS
    //**********************************************************
    // run initAndStepTest = init.then(step)
}