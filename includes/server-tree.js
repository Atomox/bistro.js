
var tree = (function treeFactory() {

    // Our most basic element of a tree.
    function Node(id, data) {
        this.data = data;
        this.id = id;
        this.parent = null;
        this.children = [];
    }
     
    // Our complete tree.
    function Tree(id, data) {
        if (!id) {
            throw new Error('Cannot instantiate tree root wihtout an ID.');
        }
        var node = new Node(id, data);
        this._root = node;
        this.counter = {};
    }

    Tree.prototype.getRoot = function() {
        return this._root;
    }


    /**
     * Initialize unique counters, which we concat with their prefix
     * to make unique node names for our tree.
     * 
     * @param  {string} prefix
     *   An optional prefix to namespace our counter.
     * 
     * @return {string}
     *   A unique name to be used for a node.
     */
    Tree.prototype.getNextUniqueId = function getNextUniqueId(prefix) {
        if (!prefix) { prefix = 'node'; }

        // If one does not exist, intialize it. Otherwise, incriment it.
        if (typeof this.counter[prefix] === 'undefined') { this.counter[prefix] = 0; }
        else { this.counter[prefix]++; }

        return prefix + this.counter[prefix];
    }


    /**
     * Find a tree node by it's ID, and return it.
     * 
     * @param {string} id
     *   The ID of a node we're searching for.
     * 
     * @return {node|false}
     *   The complete node with the passed id, or FALSE if not found.
     */
    Tree.prototype.getNode = function getNode(id, parent) {
        // Start with a node, and look at all children. 
        var current = (parent !== null) ? parent : this.getRoot();
        
        // Is this your node?
        if (current.id === id) {
            return current;
        }
        // Recurse.
        else if (current.children) {
            for (var i = 0; i < current.children.length; i++) {
                if (existingNode = getNode(id, current)) {
                    return existingNode;
                }
            }
        }
    }


    /**
     * Add a child node to the passed {parent}. If {parent} already has a child named {id},
     * we will return FALSE.
     * 
     * @param {string} id
     *   The node ID of the child we're adding to {parent}.
     * @param {[type]} data
     * @param {node} parent
     *   The parent node we should add this child to.
     *
     * @return {node|boolean}
     *   The new child node, if created. Otherwise, if {parent}.children[{id}] exists, 
     *   we return FALSE.
     */
    Tree.prototype.add = function(id, data, parent) {

        /**
           @TODO

                Confirm this is a parent node.
         */
        if (!parent || !parent.id) {
            throw new Error('Parent is a required property of a node.');
        }

        // If the ID at this level already exists, don't insert a new one.
        if (existingNode = Tree.prototype.getChild(parent, id)) {
            return false;
        }

        // Create the node, and add it.
        var node = new Node(id, data);
        node.parent = parent;
        parent.children.push(node);
        return node;
    };


    /**
     * Check to see if a child of {parent} already exists with {id}.
     * 
     * @param {node} parent
     *   A parent node, which we should check for a child with {id}.
     * @param {string|array} id
     *   The node ID(s) of one or more children, we should look for. ID is unique
     *   per parent's immediate children.
     * 
     * @return {node | boolean}
     *   The node of an existing child of {parent} which has an id of {id}.
     *   Otherwise, FALSE.
     */
    Tree.prototype.getChild = function(parent, id) {
        if (parent && parent.children) {
            var mySibling = false;

            // Force our id into an array.
            if (!Array.isArray(id) && typeof id === 'string') {
                id = [id];
            }

            // Check all children for matches to our ids.
            for (var i = 0; i < parent.children.length; i++) {
                var c = parent.children[i];

                if (typeof id === 'object' && Array.isArray(id)) {
                    for (j = 0; j < id.length; j++) {
                        if (c.id == id[j]) {
                            if (mySibling === false) {
                                mySibling = [c];
                            }
                            else {
                                mySibling.push(c);
                            }
                        }
                    }
                }
            };

            if (mySibling !== false) {
                return mySibling;
            }
        }

        return false;
    }


    Tree.prototype.dump = function dumpNodeFamily(node, level) {
        // Get the root.
        if (typeof node === 'undefined' || node == null) { node = this.getRoot(); }
        if (!level) { level = 0; }
        var children = node.children;

        var offset = Array(level+1).join(' ');

        console.log(offset, node.id + ': ', node.data);
        console.log(offset, '......');

        for (var i = 0; i < children.length; i++) {
            if (children[i]) {
               dumpNodeFamily(children[i], (level+1));
            }
        }
    }

    return {
        Tree: Tree
    };
})();

module.exports = {
    Tree: tree.Tree
};