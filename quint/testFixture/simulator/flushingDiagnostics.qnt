/*
 If you do not know how to start this lesson, see:
 https://github.com/informalsystems/quint/tree/main/tutorials
 */
module hello {

    // the state variable to keep the output by the computer
    var consoleOutput: str

    // the state variable to keep the out read by the user
    var readByUser: str

    val m: str -> str = Map()

    // initialize the state machine that captures the protocol
    action init = all {
      consoleOutput' = q::debug("Initializing console output to empty string", ""),
      readByUser' = ""
    }

    // write "Hello, world!" in consoleOutput of the state machine,
    // if the console output is clean
    action write = all {
      consoleOutput == "",
      consoleOutput' = q::debug("Writing 'Hello, world!' to console output", "Hello, world!"),
      readByUser' = readByUser,
    }

    // read the message from `consoleOutput` into `readByUser`,
    // if the console output is not clean
    action read = all {
      consoleOutput != "",
      readByUser' = q::debug("Reading console output into readByUser", consoleOutput),
      consoleOutput' = consoleOutput,
    }

    action runtimeError = all {
      consoleOutput' = q::debug("Runtime error: console output is empty and readByUser is empty", ""),
      val y = q::debug("Stop me", "x")
      val x = q::debug("Stop me", m.get(y))
      readByUser' = x
    }

    // execute a single step of the state machine:
    // it may be `read` or `write`, whatever is available
    action step = any {
      write,
      read,
      runtimeError
    }

    // a simple test that demonstrates an interaction between
    // the computer and the user
    run writeReadTest = init.then(write).then(read)
}

