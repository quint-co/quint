package systems.informal.tnt.parser;

import org.antlr.v4.runtime.*;

import java.io.IOException;

/**
 * Hello world!
 *
 */
public class App {
    public static void main(String[] args) {
        if (args.length < 1) {
            System.err.println("Use: parser <filename>.tnt");
            System.exit(2);
        }

        String filename = args[0];

        try {
            CharStream input = CharStreams.fromFileName(filename);
            TntLexer lexer = new TntLexer(input);
            CommonTokenStream tokens = new CommonTokenStream(lexer);
            TntParser parser = new TntParser(tokens);
            TntParser.ModuleContext tree = parser.module();
        } catch (IOException e) {
            System.out.println("Parse error");
            System.exit(1);
        }
        System.out.println("Parse OK");
    }
}
