module typedefs {

    // uninterpreted type literals aren't supported, so we use int for now.
    type NODE = int

    type BlockHeader = {
        height: int,
        time: int,
        lastCommit: Set[NODE],
        VS: Set[NODE],
        NextVS: Set[NODE]
    }

    type LightBlock = {
        header: BlockHeader,
        Commits: Set[NODE]
    }

    type Blockchain = int -> blockHeader
    type LightBlockMap = int -> lightBlock
    type LightBlockStatus = int -> str    
    
}