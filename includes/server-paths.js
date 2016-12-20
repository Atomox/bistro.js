
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
    }

    Tree.prototype.getRoot = function() {
        return this._root;
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
     * @param {string} id
     *   The node ID of a child, we should look for. ID is unique
     *   per parent's immediate children.
     * 
     * @return {node | boolean}
     *   The node of an existing child of {parent} which has an id of {id}.
     *   Otherwise, FALSE.
     */
    Tree.prototype.getChild = function(parent, id) {
        if (parent && parent.children) {
            var mySibling = false;

            for (var i = 0; i < parent.children.length; i++) {
                var c = parent.children[i];
                if (c.id == id) {
                    mySibling = c;
                    break;
                }
            };

            if (mySibling && mySibling.id) {
                return mySibling;
            }
        }

        return false;
    }

    return {
        Tree: Tree
    };
})();


var internalPaths = (function pathFactory() {

    // Foreach path, log a callback as data.
    var myTree = new tree.Tree('root', null),
    myRoot = myTree.getRoot('root');

    /**
     * Add a path to the internal path list. 
     * Map this path to a callback.
     * 
     * @param {string} path
     *   The path we should associate with {callback}.
     * @param {Function} callback
     *   The callback to be fired when {path} is requested.
     *
     * @return {boolean}
     *   TRUE on success, or FALSE if that path was already taken.
     */
    function add_path (path, callback) {

        console.log(' -> Adding Path: ' + path);
        
        try {
            var my_args = path.split("/");
            var my_parent = myRoot;

            for (var i = 0; i < my_args.length; i++) {
                var piece = my_args[i];
                var last_arg = (i == my_args.length - 1) ? true : false;
                var my_data = last_arg ? callback : null;

                // Add this as a node, and use it as the next iteration's parent.
                var my_node = myTree.add(piece, my_data, my_parent);

                if (my_node === false) {
                    console.log('  | Skipping path arg: ' + piece + ', parent = ' + my_parent.id);
                    my_node = myTree.getChild(my_parent, piece);
                    
                    // Existing node, but could not retrieve it.
                    if (my_node === false) {
                        throw new Error('Error. Existing node with that ID, and could not be retreived.');
                    }
                    // Existing node, last arg, and can assign callback.
                    else if (last_arg === true && my_node.data == null) {
                        my_node.data = my_data;
                    }
                    // Existing node, last arg, and callback already associated with it.
                    else if (last_arg === true && my_node.data !== null) {
                        throw new Error('This path already has a callback.');
                    }
                    // Existing node, continue.
                    else if (my_node !== false) {
                        // do nothing.
                    }
                } 
                else {
                    console.log('  | Adding path arg: ' + piece + ', parent = ' + my_parent.id);
                }

                // Our new node will soon be a parent of the next node.
                my_parent = my_node;
            }
        }
        catch (e) {
            return false;
        }

        return true;
    }


    /**
     * Try to match our path to an internal path.
     * 
     * @param {string} path
     *   A URL string we should parse.
     *   
     * @return {object | boolean}
     *   An internal path object, if one could be mapped. Otherwise, FALSE.
     */
    function get_path (path) {
        console.log(' -> Looking up Path: ' + path);
        
        try {

            // Replace the leading and trailing slashes in a URL.
            if (path.charAt(0) == '/') {
                path = path.replace("/", "");
            }
            if (path.charAt(path.length-1) == '/') {
                path = path.slice(0,-1);
            }

            var my_args = path.split("/");

            // Always start with the root parent,
            // but we'll only ever look at Root's children, or below.
            var my_parent = myRoot;

            for (var i = 0; i < my_args.length; i++) {
                var piece = my_args[i];
                var last_arg = (i == my_args.length - 1) ? true : false;

                // Look for our next arg in our parent's children.
                my_node = myTree.getChild(my_parent, piece);
                
                // If this was a miss, but we have a more general term, try that.
                if (my_node === false) {
                    my_node = myTree.getChild(my_parent, '*');
                }


                if (my_node === false) {
                    // Cannot find a match.
                    console.log('Cannot match ' + piece);
                    break;
                }
                else if (last_arg === true && my_node.data != null) {
                    return my_node.data;
                }
                else if(my_node) {
                    console.log(piece + ' matches...');
                }

                // Our new node will soon be a parent of the next node.
                my_parent = my_node;
            }
        }
        catch (e) {
            throw new Error('An error occured while evaluating an existing path. ' + e);
        }   

        return false;     
    }

    return {
        tree: myTree,
        add_path: add_path,
        get_path: get_path
    };
})();


module.exports = {
    addInternalPath: internalPaths.add_path,
    getPath: internalPaths.get_path
};


/**
  
  @TODO


     Example import:
 */
var myPaths = [
    'albums/my_first_album/photos/my_first_photo',
    'albums/my_first_album/photos/my_second_photo',
    'albums/my_third/photos/my_first_photo',
    'sets/123',
    'sets/123/234',
    'sets/123/my_first_photo'
];

myPaths.forEach(function(p) {

    if (!internalPaths.add_path(p)) {
        throw new Error('Path ' + p + ' attempting to assign callback more to existing path.');
    }

    console.log('');
});