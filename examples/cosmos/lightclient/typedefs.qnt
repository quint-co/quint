module typedefs {

    type BlockHeader = {
        height: int,
        time: int,
        lastCommit: Set[str],
        VS: Set[str],
        NextVS: Set[str]
    }

    type LightBlock = {
        header: BlockHeader,
        Commits: Set[str]
    }

    type Blockchain = int -> BlockHeader
    type LightBlockMap = int -> LightBlock
    type LightBlockStatus = int -> str    
    
}
