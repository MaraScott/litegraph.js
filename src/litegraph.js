import { BadgePosition } from "./LGraphBadge";

const globalExport = {};

(function (globalThis) {
    // *************************************************************
    //   LiteGraph CLASS                                     *******
    // *************************************************************

    /**
     * The Global Scope. It contains all the registered node classes.
     *
     * @class LiteGraph
     * @constructor
     */

    var LiteGraph = (globalThis.LiteGraph = {
        VERSION: 0.4,

        CANVAS_GRID_SIZE: 10,

        NODE_TITLE_HEIGHT: 30,
        NODE_TITLE_TEXT_Y: 20,
        NODE_SLOT_HEIGHT: 20,
        NODE_WIDGET_HEIGHT: 20,
        NODE_WIDTH: 140,
        NODE_MIN_WIDTH: 50,
        NODE_COLLAPSED_RADIUS: 10,
        NODE_COLLAPSED_WIDTH: 80,
        NODE_TITLE_COLOR: "#999",
        NODE_SELECTED_TITLE_COLOR: "#FFF",
        NODE_TEXT_SIZE: 14,
        NODE_TEXT_COLOR: "#AAA",
        NODE_SUBTEXT_SIZE: 12,
        NODE_DEFAULT_COLOR: "#333",
        NODE_DEFAULT_BGCOLOR: "#353535",
        NODE_DEFAULT_BOXCOLOR: "#666",
        NODE_DEFAULT_SHAPE: "box",
        NODE_BOX_OUTLINE_COLOR: "#FFF",
        DEFAULT_SHADOW_COLOR: "rgba(0,0,0,0.5)",
        DEFAULT_GROUP_FONT: 24,

        WIDGET_BGCOLOR: "#222",
        WIDGET_OUTLINE_COLOR: "#666",
        WIDGET_TEXT_COLOR: "#DDD",
        WIDGET_SECONDARY_TEXT_COLOR: "#999",

        LINK_COLOR: "#9A9",
        EVENT_LINK_COLOR: "#A86",
        CONNECTING_LINK_COLOR: "#AFA",

        MAX_NUMBER_OF_NODES: 10000, //avoid infinite loops
        DEFAULT_POSITION: [100, 100], //default node position
        VALID_SHAPES: ["default", "box", "round", "card"], //,"circle"

        //shapes are used for nodes but also for slots
        BOX_SHAPE: 1,
        ROUND_SHAPE: 2,
        CIRCLE_SHAPE: 3,
        CARD_SHAPE: 4,
        ARROW_SHAPE: 5,
        GRID_SHAPE: 6, // intended for slot arrays

        //enums
        INPUT: 1,
        OUTPUT: 2,

        EVENT: -1, //for outputs
        ACTION: -1, //for inputs

        NODE_MODES: ["Always", "On Event", "Never", "On Trigger"], // helper, will add "On Request" and more in the future
        NODE_MODES_COLORS:["#666","#422","#333","#224","#626"], // use with node_box_coloured_by_mode
        ALWAYS: 0,
        ON_EVENT: 1,
        NEVER: 2,
        ON_TRIGGER: 3,

        UP: 1,
        DOWN: 2,
        LEFT: 3,
        RIGHT: 4,
        CENTER: 5,

        LINK_RENDER_MODES: ["Straight", "Linear", "Spline"], // helper
        STRAIGHT_LINK: 0,
        LINEAR_LINK: 1,
        SPLINE_LINK: 2,

        NORMAL_TITLE: 0,
        NO_TITLE: 1,
        TRANSPARENT_TITLE: 2,
        AUTOHIDE_TITLE: 3,
        VERTICAL_LAYOUT: "vertical", // arrange nodes vertically

        proxy: null, //used to redirect calls
        node_images_path: "",

        debug: false,
        catch_exceptions: true,
        throw_errors: true,
        allow_scripts: false, //if set to true some nodes like Formula would be allowed to evaluate code that comes from unsafe sources (like node configuration), which could lead to exploits
        registered_node_types: {}, //nodetypes by string
        node_types_by_file_extension: {}, //used for dropping files in the canvas
        Nodes: {}, //node types by classname
		Globals: {}, //used to store vars between graphs

        searchbox_extras: {}, //used to add extra features to the search box
        auto_sort_node_types: false, // [true!] If set to true, will automatically sort node types / categories in the context menus
		
		node_box_coloured_when_on: false, // [true!] this make the nodes box (top left circle) coloured when triggered (execute/action), visual feedback
        node_box_coloured_by_mode: false, // [true!] nodebox based on node mode, visual feedback
        
        dialog_close_on_mouse_leave: false, // [false on mobile] better true if not touch device, TODO add an helper/listener to close if false
        dialog_close_on_mouse_leave_delay: 500,
        
        shift_click_do_break_link_from: false, // [false!] prefer false if results too easy to break links - implement with ALT or TODO custom keys
        click_do_break_link_to: false, // [false!]prefer false, way too easy to break links
        ctrl_alt_click_do_break_link: true, // [true!] who accidentally ctrl-alt-clicks on an in/output? nobody! that's who!
        
        search_hide_on_mouse_leave: true, // [false on mobile] better true if not touch device, TODO add an helper/listener to close if false
        search_filter_enabled: false, // [true!] enable filtering slots type in the search widget, !requires auto_load_slot_types or manual set registered_slot_[in/out]_types and slot_types_[in/out]
        search_show_all_on_open: true, // [true!] opens the results list when opening the search widget
        
        auto_load_slot_types: false, // [if want false, use true, run, get vars values to be statically set, than disable] nodes types and nodeclass association with node types need to be calculated, if dont want this, calculate once and set registered_slot_[in/out]_types and slot_types_[in/out]
        
		// set these values if not using auto_load_slot_types
        registered_slot_in_types: {}, // slot types for nodeclass
        registered_slot_out_types: {}, // slot types for nodeclass
        slot_types_in: [], // slot types IN
        slot_types_out: [], // slot types OUT
        slot_types_default_in: [], // specify for each IN slot type a(/many) default node(s), use single string, array, or object (with node, title, parameters, ..) like for search
		slot_types_default_out: [], // specify for each OUT slot type a(/many) default node(s), use single string, array, or object (with node, title, parameters, ..) like for search
		
		alt_drag_do_clone_nodes: false, // [true!] very handy, ALT click to clone and drag the new node

		do_add_triggers_slots: false, // [true!] will create and connect event slots when using action/events connections, !WILL CHANGE node mode when using onTrigger (enable mode colors), onExecuted does not need this
		
		allow_multi_output_for_events: true, // [false!] being events, it is strongly reccomended to use them sequentially, one by one

		middle_click_slot_add_default_node: false, //[true!] allows to create and connect a ndoe clicking with the third button (wheel)
		
		release_link_on_empty_shows_menu: false, //[true!] dragging a link to empty space will open a menu, add from list, search or defaults
		
        pointerevents_method: "pointer", // "mouse"|"pointer" use mouse for retrocompatibility issues? (none found @ now)
        // TODO implement pointercancel, gotpointercapture, lostpointercapture, (pointerover, pointerout if necessary)

        ctrl_shift_v_paste_connect_unselected_outputs: true, //[true!] allows ctrl + shift + v to paste nodes with the outputs of the unselected nodes connected with the inputs of the newly pasted nodes

        // if true, all newly created nodes/links will use string UUIDs for their id fields instead of integers.
        // use this if you must have node IDs that are unique across all graphs and subgraphs.
        use_uuids: false,

        // Whether to highlight the bounding box of selected groups
        highlight_selected_group: false,

        /**
         * Register a node class so it can be listed when the user wants to create a new one
         * @method registerNodeType
         * @param {String} type name of the node and path
         * @param {Class} base_class class containing the structure of a node
         */

        registerNodeType: function(type, base_class) {
            if (!base_class.prototype) {
                throw "Cannot register a simple object, it must be a class with a prototype";
            }
            base_class.type = type;

            if (LiteGraph.debug) {
                console.log("Node registered: " + type);
            }

            const classname = base_class.name;

            const pos = type.lastIndexOf("/");
            base_class.category = type.substring(0, pos);

            if (!base_class.title) {
                base_class.title = classname;
            }

            //extend class
            for (var i in LGraphNode.prototype) {
                if (!base_class.prototype[i]) {
                    base_class.prototype[i] = LGraphNode.prototype[i];
                }
            }

            const prev = this.registered_node_types[type];
            if(prev) {
                console.log("replacing node type: " + type);
            }
            if( !Object.prototype.hasOwnProperty.call( base_class.prototype, "shape") ) {
                Object.defineProperty(base_class.prototype, "shape", {
                    set: function(v) {
                        switch (v) {
                            case "default":
                                delete this._shape;
                                break;
                            case "box":
                                this._shape = LiteGraph.BOX_SHAPE;
                                break;
                            case "round":
                                this._shape = LiteGraph.ROUND_SHAPE;
                                break;
                            case "circle":
                                this._shape = LiteGraph.CIRCLE_SHAPE;
                                break;
                            case "card":
                                this._shape = LiteGraph.CARD_SHAPE;
                                break;
                            default:
                                this._shape = v;
                        }
                    },
                    get: function() {
                        return this._shape;
                    },
                    enumerable: true,
                    configurable: true
                });
                

                //used to know which nodes to create when dragging files to the canvas
                if (base_class.supported_extensions) {
                    for (let i in base_class.supported_extensions) {
                        const ext = base_class.supported_extensions[i];
                        if(ext && ext.constructor === String) {
                            this.node_types_by_file_extension[ ext.toLowerCase() ] = base_class;
                        }
                    }
                }
            }

            this.registered_node_types[type] = base_class;
            if (base_class.constructor.name) {
                this.Nodes[classname] = base_class;
            }
            if (LiteGraph.onNodeTypeRegistered) {
                LiteGraph.onNodeTypeRegistered(type, base_class);
            }
            if (prev && LiteGraph.onNodeTypeReplaced) {
                LiteGraph.onNodeTypeReplaced(type, base_class, prev);
            }

            //warnings
            if (base_class.prototype.onPropertyChange) {
                console.warn(
                    "LiteGraph node class " +
                        type +
                        " has onPropertyChange method, it must be called onPropertyChanged with d at the end"
                );
            }
            
            // TODO one would want to know input and ouput :: this would allow through registerNodeAndSlotType to get all the slots types
            if (this.auto_load_slot_types) {
                new base_class(base_class.title || "tmpnode");
            }
        },

        /**
         * removes a node type from the system
         * @method unregisterNodeType
         * @param {String|Object} type name of the node or the node constructor itself
         */
        unregisterNodeType: function(type) {
            const base_class =
                type.constructor === String
                    ? this.registered_node_types[type]
                    : type;
            if (!base_class) {
                throw "node type not found: " + type;
            }
            delete this.registered_node_types[base_class.type];
            if (base_class.constructor.name) {
                delete this.Nodes[base_class.constructor.name];
            }
        },

        /**
        * Save a slot type and his node
        * @method registerSlotType
        * @param {String|Object} type name of the node or the node constructor itself
        * @param {String} slot_type name of the slot type (variable type), eg. string, number, array, boolean, ..
        */
        registerNodeAndSlotType: function(type, slot_type, out){
            out = out || false;
            const base_class =
                type.constructor === String &&
                this.registered_node_types[type] !== "anonymous"
                    ? this.registered_node_types[type]
                    : type;

            const class_type = base_class.constructor.type;

            let allTypes = [];
            if (typeof slot_type === "string") {
                allTypes = slot_type.split(",");
            } else if (slot_type == this.EVENT || slot_type == this.ACTION) {
                allTypes = ["_event_"];
            } else {
                allTypes = ["*"];
            }

            for (let i = 0; i < allTypes.length; ++i) {
                let slotType = allTypes[i];
                if (slotType === "") {
                    slotType = "*";
                }
                const registerTo = out
                    ? "registered_slot_out_types"
                    : "registered_slot_in_types";
                if (this[registerTo][slotType] === undefined) {
                    this[registerTo][slotType] = { nodes: [] };
                }
                if (!this[registerTo][slotType].nodes.includes(class_type)) {
                    this[registerTo][slotType].nodes.push(class_type);
                }

                // check if is a new type
                if (!out) {
                    if (!this.slot_types_in.includes(slotType.toLowerCase())) {
                        this.slot_types_in.push(slotType.toLowerCase());
                        this.slot_types_in.sort();
                    }
                } else {
                    if (!this.slot_types_out.includes(slotType.toLowerCase())) {
                        this.slot_types_out.push(slotType.toLowerCase());
                        this.slot_types_out.sort();
                    }
                }
            }
        },
        
        /**
         * Create a new nodetype by passing a function, it wraps it with a proper class and generates inputs according to the parameters of the function.
         * Useful to wrap simple methods that do not require properties, and that only process some input to generate an output.
         * @method wrapFunctionAsNode
         * @param {String} name node name with namespace (p.e.: 'math/sum')
         * @param {Function} func
         * @param {Array} param_types [optional] an array containing the type of every parameter, otherwise parameters will accept any type
         * @param {String} return_type [optional] string with the return type, otherwise it will be generic
         * @param {Object} properties [optional] properties to be configurable
         */
        wrapFunctionAsNode: function(
            name,
            func,
            param_types,
            return_type,
            properties
        ) {
            var params = Array(func.length);
            var code = "";
            var names = LiteGraph.getParameterNames(func);
            for (var i = 0; i < names.length; ++i) {
                code +=
                    "this.addInput('" +
                    names[i] +
                    "'," +
                    (param_types && param_types[i]
                        ? "'" + param_types[i] + "'"
                        : "0") +
                    ");\n";
            }
            code +=
                "this.addOutput('out'," +
                (return_type ? "'" + return_type + "'" : 0) +
                ");\n";
            if (properties) {
                code +=
                    "this.properties = " + JSON.stringify(properties) + ";\n";
            }
            var classobj = Function(code);
            classobj.title = name.split("/").pop();
            classobj.desc = "Generated from " + func.name;
            classobj.prototype.onExecute = function onExecute() {
                for (var i = 0; i < params.length; ++i) {
                    params[i] = this.getInputData(i);
                }
                var r = func.apply(this, params);
                this.setOutputData(0, r);
            };
            this.registerNodeType(name, classobj);
        },

        /**
         * Removes all previously registered node's types
         */
        clearRegisteredTypes: function() {
            this.registered_node_types = {};
            this.node_types_by_file_extension = {};
            this.Nodes = {};
            this.searchbox_extras = {};
        },

        /**
         * Adds this method to all nodetypes, existing and to be created
         * (You can add it to LGraphNode.prototype but then existing node types wont have it)
         * @method addNodeMethod
         * @param {Function} func
         */
        addNodeMethod: function(name, func) {
            LGraphNode.prototype[name] = func;
            for (var i in this.registered_node_types) {
                var type = this.registered_node_types[i];
                if (type.prototype[name]) {
                    type.prototype["_" + name] = type.prototype[name];
                } //keep old in case of replacing
                type.prototype[name] = func;
            }
        },

        /**
         * Create a node of a given type with a name. The node is not attached to any graph yet.
         * @method createNode
         * @param {String} type full name of the node class. p.e. "math/sin"
         * @param {String} name a name to distinguish from other nodes
         * @param {Object} options to set options
         */

        createNode: function(type, title, options) {
            var base_class = this.registered_node_types[type];
            if (!base_class) {
                if (LiteGraph.debug) {
                    console.log(
                        'GraphNode type "' + type + '" not registered.'
                    );
                }
                return null;
            }

            var prototype = base_class.prototype || base_class;

            title = title || base_class.title || type;

            var node = null;

            if (LiteGraph.catch_exceptions) {
                try {
                    node = new base_class(title);
                } catch (err) {
                    console.error(err);
                    return null;
                }
            } else {
                node = new base_class(title);
            }

            node.type = type;

            if (!node.title && title) {
                node.title = title;
            }
            if (!node.properties) {
                node.properties = {};
            }
            if (!node.properties_info) {
                node.properties_info = [];
            }
            if (!node.flags) {
                node.flags = {};
            }
            if (!node.size) {
                node.size = node.computeSize();
				//call onresize?
            }
            if (!node.pos) {
                node.pos = LiteGraph.DEFAULT_POSITION.concat();
            }
            if (!node.mode) {
                node.mode = LiteGraph.ALWAYS;
            }

            //extra options
            if (options) {
                for (var i in options) {
                    node[i] = options[i];
                }
            }

			// callback
            if ( node.onNodeCreated ) {
                node.onNodeCreated();
            }
            
            return node;
        },

        /**
         * Returns a registered node type with a given name
         * @method getNodeType
         * @param {String} type full name of the node class. p.e. "math/sin"
         * @return {Class} the node class
         */
        getNodeType: function(type) {
            return this.registered_node_types[type];
        },

        /**
         * Returns a list of node types matching one category
         * @method getNodeType
         * @param {String} category category name
         * @return {Array} array with all the node classes
         */

        getNodeTypesInCategory: function(category, filter) {
            var r = [];
            for (var i in this.registered_node_types) {
                var type = this.registered_node_types[i];
                if (type.filter != filter) {
                    continue;
                }

                if (category == "") {
                    if (type.category == null) {
                        r.push(type);
                    }
                } else if (type.category == category) {
                    r.push(type);
                }
            }

            if (this.auto_sort_node_types) {
                r.sort(function(a,b){return a.title.localeCompare(b.title)});
            }

            return r;
        },

        /**
         * Returns a list with all the node type categories
         * @method getNodeTypesCategories
         * @param {String} filter only nodes with ctor.filter equal can be shown
         * @return {Array} array with all the names of the categories
         */
        getNodeTypesCategories: function( filter ) {
            var categories = { "": 1 };
            for (var i in this.registered_node_types) {
				var type = this.registered_node_types[i];
                if ( type.category && !type.skip_list )
                {
					if(type.filter != filter)
						continue;
                    categories[type.category] = 1;
                }
            }
            var result = [];
            for (var i in categories) {
                result.push(i);
            }
            return this.auto_sort_node_types ? result.sort() : result;
        },

        //debug purposes: reloads all the js scripts that matches a wildcard
        reloadNodes: function(folder_wildcard) {
            var tmp = document.getElementsByTagName("script");
            //weird, this array changes by its own, so we use a copy
            var script_files = [];
            for (var i=0; i < tmp.length; i++) {
                script_files.push(tmp[i]);
            }

            var docHeadObj = document.getElementsByTagName("head")[0];
            folder_wildcard = document.location.href + folder_wildcard;

            for (var i=0; i < script_files.length; i++) {
                var src = script_files[i].src;
                if (
                    !src ||
                    src.substr(0, folder_wildcard.length) != folder_wildcard
                ) {
                    continue;
                }

                try {
                    if (LiteGraph.debug) {
                        console.log("Reloading: " + src);
                    }
                    var dynamicScript = document.createElement("script");
                    dynamicScript.type = "text/javascript";
                    dynamicScript.src = src;
                    docHeadObj.appendChild(dynamicScript);
                    docHeadObj.removeChild(script_files[i]);
                } catch (err) {
                    if (LiteGraph.throw_errors) {
                        throw err;
                    }
                    if (LiteGraph.debug) {
                        console.log("Error while reloading " + src);
                    }
                }
            }

            if (LiteGraph.debug) {
                console.log("Nodes reloaded");
            }
        },

        //separated just to improve if it doesn't work
        cloneObject: function(obj, target) {
            if (obj == null) {
                return null;
            }
            var r = JSON.parse(JSON.stringify(obj));
            if (!target) {
                return r;
            }

            for (var i in r) {
                target[i] = r[i];
            }
            return target;
        },

        /*
         * https://gist.github.com/jed/982883?permalink_comment_id=852670#gistcomment-852670
         */
        uuidv4: function() {
            return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,a=>(a^Math.random()*16>>a/4).toString(16));
        },

        /**
         * Returns if the types of two slots are compatible (taking into account wildcards, etc)
         * @method isValidConnection
         * @param {String} type_a
         * @param {String} type_b
         * @return {Boolean} true if they can be connected
         */
        isValidConnection: function(type_a, type_b) {
			if (type_a=="" || type_a==="*") type_a = 0;
			if (type_b=="" || type_b==="*") type_b = 0;
            if (
                !type_a //generic output
                || !type_b // generic input
                || type_a == type_b //same type (is valid for triggers)
                || (type_a == LiteGraph.EVENT && type_b == LiteGraph.ACTION)
            ) {
                return true;
            }

            // Enforce string type to handle toLowerCase call (-1 number not ok)
            type_a = String(type_a);
            type_b = String(type_b);
            type_a = type_a.toLowerCase();
            type_b = type_b.toLowerCase();

            // For nodes supporting multiple connection types
            if (type_a.indexOf(",") == -1 && type_b.indexOf(",") == -1) {
                return type_a == type_b;
            }

            // Check all permutations to see if one is valid
            var supported_types_a = type_a.split(",");
            var supported_types_b = type_b.split(",");
            for (var i = 0; i < supported_types_a.length; ++i) {
                for (var j = 0; j < supported_types_b.length; ++j) {
                    if(this.isValidConnection(supported_types_a[i],supported_types_b[j])){
					//if (supported_types_a[i] == supported_types_b[j]) {
                        return true;
                    }
                }
            }

            return false;
        },

        /**
         * Register a string in the search box so when the user types it it will recommend this node
         * @method registerSearchboxExtra
         * @param {String} node_type the node recommended
         * @param {String} description text to show next to it
         * @param {Object} data it could contain info of how the node should be configured
         * @return {Boolean} true if they can be connected
         */
        registerSearchboxExtra: function(node_type, description, data) {
            this.searchbox_extras[description.toLowerCase()] = {
                type: node_type,
                desc: description,
                data: data
            };
        },

        /**
         * Wrapper to load files (from url using fetch or from file using FileReader)
         * @method fetchFile
         * @param {String|File|Blob} url the url of the file (or the file itself)
         * @param {String} type an string to know how to fetch it: "text","arraybuffer","json","blob"
         * @param {Function} on_complete callback(data)
         * @param {Function} on_error in case of an error
         * @return {FileReader|Promise} returns the object used to 
         */
		fetchFile: function( url, type, on_complete, on_error ) {
			var that = this;
			if(!url)
				return null;

			type = type || "text";
			if( url.constructor === String )
			{
				if (url.substr(0, 4) == "http" && LiteGraph.proxy) {
					url = LiteGraph.proxy + url.substr(url.indexOf(":") + 3);
				}
				return fetch(url)
				.then(function(response) {
					if(!response.ok)
						 throw new Error("File not found"); //it will be catch below
					if(type == "arraybuffer")
						return response.arrayBuffer();
					else if(type == "text" || type == "string")
						return response.text();
					else if(type == "json")
						return response.json();
					else if(type == "blob")
						return response.blob();
				})
				.then(function(data) {
					if(on_complete)
						on_complete(data);
				})
				.catch(function(error) {
					console.error("error fetching file:",url);
					if(on_error)
						on_error(error);
				});
			}
			else if( url.constructor === File || url.constructor === Blob)
			{
				var reader = new FileReader();
				reader.onload = function(e)
				{
					var v = e.target.result;
					if( type == "json" )
						v = JSON.parse(v);
					if(on_complete)
						on_complete(v);
				}
				if(type == "arraybuffer")
					return reader.readAsArrayBuffer(url);
				else if(type == "text" || type == "json")
					return reader.readAsText(url);
				else if(type == "blob")
					return reader.readAsBinaryString(url);
			}
			return null;
		}
    });

    //timer that works everywhere
    if (typeof performance != "undefined") {
        LiteGraph.getTime = performance.now.bind(performance);
    } else if (typeof Date != "undefined" && Date.now) {
        LiteGraph.getTime = Date.now.bind(Date);
    } else if (typeof process != "undefined") {
        LiteGraph.getTime = function() {
            var t = process.hrtime();
            return t[0] * 0.001 + t[1] * 1e-6;
        };
    } else {
        LiteGraph.getTime = function getTime() {
            return new Date().getTime();
        };
    }

    //*********************************************************************************
    // LGraph CLASS
    //*********************************************************************************

    /**
     * LGraph is the class that contain a full graph. We instantiate one and add nodes to it, and then we can run the execution loop.
	 * supported callbacks:
		+ onNodeAdded: when a new node is added to the graph
		+ onNodeRemoved: when a node inside this graph is removed
		+ onNodeConnectionChange: some connection has changed in the graph (connected or disconnected)
     *
     * @class LGraph
     * @constructor
     * @param {Object} o data from previous serialization [optional]
     */
    class LGraph {
        //default supported types
        static supported_types = ["number", "string", "boolean"];
        static STATUS_STOPPED = 1;
        static STATUS_RUNNING = 2;

        constructor(o) {
            if (LiteGraph.debug) {
                console.log("Graph created");
            }
            this.list_of_graphcanvas = null;
            this.clear();

            if (o) {
                this.configure(o);
            }
        }
        //used to know which types of connections support this graph (some graphs do not allow certain types)
        getSupportedTypes() {
            return this.supported_types || LGraph.supported_types;
        }
        /**
             * Removes all nodes from this graph
             * @method clear
             */
        clear() {
            this.stop();
            this.status = LGraph.STATUS_STOPPED;

            this.last_node_id = 0;
            this.last_link_id = 0;

            this._version = -1; //used to detect changes


            //safe clear
            if (this._nodes) {
                for (var i = 0; i < this._nodes.length; ++i) {
                    var node = this._nodes[i];
                    if (node.onRemoved) {
                        node.onRemoved();
                    }
                }
            }

            //nodes
            this._nodes = [];
            this._nodes_by_id = {};
            this._nodes_in_order = []; //nodes sorted in execution order
            this._nodes_executable = null; //nodes that contain onExecute sorted in execution order


            //other scene stuff
            this._groups = [];

            //links
            this.links = {}; //container with all the links


            //iterations
            this.iteration = 0;

            //custom data
            this.config = {};
            this.vars = {};
            this.extra = {}; //to store custom data


            //timing
            this.globaltime = 0;
            this.runningtime = 0;
            this.fixedtime = 0;
            this.fixedtime_lapse = 0.01;
            this.elapsed_time = 0.01;
            this.last_update_time = 0;
            this.starttime = 0;

            this.catch_errors = true;

            this.nodes_executing = [];
            this.nodes_actioning = [];
            this.nodes_executedAction = [];

            //subgraph_data
            this.inputs = {};
            this.outputs = {};

            //notify canvas to redraw
            this.change();

            this.sendActionToCanvas("clear");
        }

        get nodes() {
            return this._nodes;
        }

        get groups() {
            return this._groups;
        }

        /**
             * Attach Canvas to this graph
             * @method attachCanvas
             * @param {GraphCanvas} graph_canvas
             */
        attachCanvas(graphcanvas) {
            if (graphcanvas.constructor != LGraphCanvas) {
                throw "attachCanvas expects a LGraphCanvas instance";
            }
            if (graphcanvas.graph && graphcanvas.graph != this) {
                graphcanvas.graph.detachCanvas(graphcanvas);
            }

            graphcanvas.graph = this;

            if (!this.list_of_graphcanvas) {
                this.list_of_graphcanvas = [];
            }
            this.list_of_graphcanvas.push(graphcanvas);
        }
        /**
             * Detach Canvas from this graph
             * @method detachCanvas
             * @param {GraphCanvas} graph_canvas
             */
        detachCanvas(graphcanvas) {
            if (!this.list_of_graphcanvas) {
                return;
            }

            var pos = this.list_of_graphcanvas.indexOf(graphcanvas);
            if (pos == -1) {
                return;
            }
            graphcanvas.graph = null;
            this.list_of_graphcanvas.splice(pos, 1);
        }
        /**
             * Starts running this graph every interval milliseconds.
             * @method start
             * @param {number} interval amount of milliseconds between executions, if 0 then it renders to the monitor refresh rate
             */
        start(interval) {
            if (this.status == LGraph.STATUS_RUNNING) {
                return;
            }
            this.status = LGraph.STATUS_RUNNING;

            if (this.onPlayEvent) {
                this.onPlayEvent();
            }

            this.sendEventToAllNodes("onStart");

            //launch
            this.starttime = LiteGraph.getTime();
            this.last_update_time = this.starttime;
            interval = interval || 0;
            var that = this;

            //execute once per frame
            if (interval == 0 && typeof window != "undefined" && window.requestAnimationFrame) {
                function on_frame() {
                    if (that.execution_timer_id != -1) {
                        return;
                    }
                    window.requestAnimationFrame(on_frame);
                    if (that.onBeforeStep)
                        that.onBeforeStep();
                    that.runStep(1, !that.catch_errors);
                    if (that.onAfterStep)
                        that.onAfterStep();
                }
                this.execution_timer_id = -1;
                on_frame();
            } else { //execute every 'interval' ms
                this.execution_timer_id = setInterval(function () {
                    //execute
                    if (that.onBeforeStep)
                        that.onBeforeStep();
                    that.runStep(1, !that.catch_errors);
                    if (that.onAfterStep)
                        that.onAfterStep();
                }, interval);
            }
        }
        /**
             * Stops the execution loop of the graph
             * @method stop execution
             */
        stop() {
            if (this.status == LGraph.STATUS_STOPPED) {
                return;
            }

            this.status = LGraph.STATUS_STOPPED;

            if (this.onStopEvent) {
                this.onStopEvent();
            }

            if (this.execution_timer_id != null) {
                if (this.execution_timer_id != -1) {
                    clearInterval(this.execution_timer_id);
                }
                this.execution_timer_id = null;
            }

            this.sendEventToAllNodes("onStop");
        }
        /**
             * Run N steps (cycles) of the graph
             * @method runStep
             * @param {number} num number of steps to run, default is 1
             * @param {Boolean} do_not_catch_errors [optional] if you want to try/catch errors
             * @param {number} limit max number of nodes to execute (used to execute from start to a node)
             */
        runStep(num, do_not_catch_errors, limit) {
            num = num || 1;

            var start = LiteGraph.getTime();
            this.globaltime = 0.001 * (start - this.starttime);

            var nodes = this._nodes_executable
                ? this._nodes_executable
                : this._nodes;
            if (!nodes) {
                return;
            }

            limit = limit || nodes.length;

            if (do_not_catch_errors) {
                //iterations
                for (var i = 0; i < num; i++) {
                    for (var j = 0; j < limit; ++j) {
                        var node = nodes[j];
                        if (node.mode == LiteGraph.ALWAYS && node.onExecute) {
                            //wrap node.onExecute();
                            node.doExecute();
                        }
                    }

                    this.fixedtime += this.fixedtime_lapse;
                    if (this.onExecuteStep) {
                        this.onExecuteStep();
                    }
                }

                if (this.onAfterExecute) {
                    this.onAfterExecute();
                }
            } else {
                try {
                    //iterations
                    for (var i = 0; i < num; i++) {
                        for (var j = 0; j < limit; ++j) {
                            var node = nodes[j];
                            if (node.mode == LiteGraph.ALWAYS && node.onExecute) {
                                node.onExecute();
                            }
                        }

                        this.fixedtime += this.fixedtime_lapse;
                        if (this.onExecuteStep) {
                            this.onExecuteStep();
                        }
                    }

                    if (this.onAfterExecute) {
                        this.onAfterExecute();
                    }
                    this.errors_in_execution = false;
                } catch (err) {
                    this.errors_in_execution = true;
                    if (LiteGraph.throw_errors) {
                        throw err;
                    }
                    if (LiteGraph.debug) {
                        console.log("Error during execution: " + err);
                    }
                    this.stop();
                }
            }

            var now = LiteGraph.getTime();
            var elapsed = now - start;
            if (elapsed == 0) {
                elapsed = 1;
            }
            this.execution_time = 0.001 * elapsed;
            this.globaltime += 0.001 * elapsed;
            this.iteration += 1;
            this.elapsed_time = (now - this.last_update_time) * 0.001;
            this.last_update_time = now;
            this.nodes_executing = [];
            this.nodes_actioning = [];
            this.nodes_executedAction = [];
        }
        /**
             * Updates the graph execution order according to relevance of the nodes (nodes with only outputs have more relevance than
             * nodes with only inputs.
             * @method updateExecutionOrder
             */
        updateExecutionOrder() {
            this._nodes_in_order = this.computeExecutionOrder(false);
            this._nodes_executable = [];
            for (var i = 0; i < this._nodes_in_order.length; ++i) {
                if (this._nodes_in_order[i].onExecute) {
                    this._nodes_executable.push(this._nodes_in_order[i]);
                }
            }
        }
        //This is more internal, it computes the executable nodes in order and returns it
        computeExecutionOrder(only_onExecute,
            set_level) {
            var L = [];
            var S = [];
            var M = {};
            var visited_links = {}; //to avoid repeating links
            var remaining_links = {}; //to a


            //search for the nodes without inputs (starting nodes)
            for (var i = 0, l = this._nodes.length; i < l; ++i) {
                var node = this._nodes[i];
                if (only_onExecute && !node.onExecute) {
                    continue;
                }

                M[node.id] = node; //add to pending nodes

                var num = 0; //num of input connections
                if (node.inputs) {
                    for (var j = 0, l2 = node.inputs.length; j < l2; j++) {
                        if (node.inputs[j] && node.inputs[j].link != null) {
                            num += 1;
                        }
                    }
                }

                if (num == 0) {
                    //is a starting node
                    S.push(node);
                    if (set_level) {
                        node._level = 1;
                    }
                } //num of input links
                else {
                    if (set_level) {
                        node._level = 0;
                    }
                    remaining_links[node.id] = num;
                }
            }

            while (true) {
                if (S.length == 0) {
                    break;
                }

                //get an starting node
                var node = S.shift();
                L.push(node); //add to ordered list
                delete M[node.id]; //remove from the pending nodes

                if (!node.outputs) {
                    continue;
                }

                //for every output
                for (var i = 0; i < node.outputs.length; i++) {
                    var output = node.outputs[i];
                    //not connected
                    if (output == null ||
                        output.links == null ||
                        output.links.length == 0) {
                        continue;
                    }

                    //for every connection
                    for (var j = 0; j < output.links.length; j++) {
                        var link_id = output.links[j];
                        var link = this.links[link_id];
                        if (!link) {
                            continue;
                        }

                        //already visited link (ignore it)
                        if (visited_links[link.id]) {
                            continue;
                        }

                        var target_node = this.getNodeById(link.target_id);
                        if (target_node == null) {
                            visited_links[link.id] = true;
                            continue;
                        }

                        if (set_level &&
                            (!target_node._level ||
                                target_node._level <= node._level)) {
                            target_node._level = node._level + 1;
                        }

                        visited_links[link.id] = true; //mark as visited
                        remaining_links[target_node.id] -= 1; //reduce the number of links remaining
                        if (remaining_links[target_node.id] == 0) {
                            S.push(target_node);
                        } //if no more links, then add to starters array
                    }
                }
            }

            //the remaining ones (loops)
            for (var i in M) {
                L.push(M[i]);
            }

            if (L.length != this._nodes.length && LiteGraph.debug) {
                console.warn("something went wrong, nodes missing");
            }

            var l = L.length;

            //save order number in the node
            for (var i = 0; i < l; ++i) {
                L[i].order = i;
            }

            //sort now by priority
            L = L.sort(function (A, B) {
                var Ap = A.constructor.priority || A.priority || 0;
                var Bp = B.constructor.priority || B.priority || 0;
                if (Ap == Bp) {
                    //if same priority, sort by order
                    return A.order - B.order;
                }
                return Ap - Bp; //sort by priority
            });

            //save order number in the node, again...
            for (var i = 0; i < l; ++i) {
                L[i].order = i;
            }

            return L;
        }
        /**
             * Returns all the nodes that could affect this one (ancestors) by crawling all the inputs recursively.
             * It doesn't include the node itself
             * @method getAncestors
             * @return {Array} an array with all the LGraphNodes that affect this node, in order of execution
             */
        getAncestors(node) {
            var ancestors = [];
            var pending = [node];
            var visited = {};

            while (pending.length) {
                var current = pending.shift();
                if (!current.inputs) {
                    continue;
                }
                if (!visited[current.id] && current != node) {
                    visited[current.id] = true;
                    ancestors.push(current);
                }

                for (var i = 0; i < current.inputs.length; ++i) {
                    var input = current.getInputNode(i);
                    if (input && ancestors.indexOf(input) == -1) {
                        pending.push(input);
                    }
                }
            }

            ancestors.sort(function (a, b) {
                return a.order - b.order;
            });
            return ancestors;
        }
        /**
             * Positions every node in a more readable manner
             * @method arrange
             */
        arrange(margin, layout) {
            margin = margin || 100;

            const nodes = this.computeExecutionOrder(false, true);
            const columns = [];
            for (let i = 0; i < nodes.length; ++i) {
                const node = nodes[i];
                const col = node._level || 1;
                if (!columns[col]) {
                    columns[col] = [];
                }
                columns[col].push(node);
            }

            let x = margin;

            for (let i = 0; i < columns.length; ++i) {
                const column = columns[i];
                if (!column) {
                    continue;
                }
                let max_size = 100;
                let y = margin + LiteGraph.NODE_TITLE_HEIGHT;
                for (let j = 0; j < column.length; ++j) {
                    const node = column[j];
                    node.pos[0] = (layout == LiteGraph.VERTICAL_LAYOUT) ? y : x;
                    node.pos[1] = (layout == LiteGraph.VERTICAL_LAYOUT) ? x : y;
                    const max_size_index = (layout == LiteGraph.VERTICAL_LAYOUT) ? 1 : 0;
                    if (node.size[max_size_index] > max_size) {
                        max_size = node.size[max_size_index];
                    }
                    const node_size_index = (layout == LiteGraph.VERTICAL_LAYOUT) ? 0 : 1;
                    y += node.size[node_size_index] + margin + LiteGraph.NODE_TITLE_HEIGHT;
                }
                x += max_size + margin;
            }

            this.setDirtyCanvas(true, true);
        }
        /**
             * Returns the amount of time the graph has been running in milliseconds
             * @method getTime
             * @return {number} number of milliseconds the graph has been running
             */
        getTime() {
            return this.globaltime;
        }
        /**
             * Returns the amount of time accumulated using the fixedtime_lapse var. This is used in context where the time increments should be constant
             * @method getFixedTime
             * @return {number} number of milliseconds the graph has been running
             */
        getFixedTime() {
            return this.fixedtime;
        }
        /**
             * Returns the amount of time it took to compute the latest iteration. Take into account that this number could be not correct
             * if the nodes are using graphical actions
             * @method getElapsedTime
             * @return {number} number of milliseconds it took the last cycle
             */
        getElapsedTime() {
            return this.elapsed_time;
        }
        /**
             * Sends an event to all the nodes, useful to trigger stuff
             * @method sendEventToAllNodes
             * @param {String} eventname the name of the event (function to be called)
             * @param {Array} params parameters in array format
             */
        sendEventToAllNodes(eventname, params, mode) {
            mode = mode || LiteGraph.ALWAYS;

            var nodes = this._nodes_in_order ? this._nodes_in_order : this._nodes;
            if (!nodes) {
                return;
            }

            for (var j = 0, l = nodes.length; j < l; ++j) {
                var node = nodes[j];

                if (node.constructor === LiteGraph.Subgraph &&
                    eventname != "onExecute") {
                    if (node.mode == mode) {
                        node.sendEventToAllNodes(eventname, params, mode);
                    }
                    continue;
                }

                if (!node[eventname] || node.mode != mode) {
                    continue;
                }
                if (params === undefined) {
                    node[eventname]();
                } else if (params && params.constructor === Array) {
                    node[eventname].apply(node, params);
                } else {
                    node[eventname](params);
                }
            }
        }
        sendActionToCanvas(action, params) {
            if (!this.list_of_graphcanvas) {
                return;
            }

            for (var i = 0; i < this.list_of_graphcanvas.length; ++i) {
                var c = this.list_of_graphcanvas[i];
                if (c[action]) {
                    c[action].apply(c, params);
                }
            }
        }
        /**
             * Adds a new node instance to this graph
             * @method add
             * @param {LGraphNode} node the instance of the node
             */
        add(node, skip_compute_order) {
            if (!node) {
                return;
            }

            //groups
            if (node.constructor === LGraphGroup) {
                this._groups.push(node);
                this.setDirtyCanvas(true);
                this.change();
                node.graph = this;
                this._version++;
                return;
            }

            //nodes
            if (node.id != -1 && this._nodes_by_id[node.id] != null) {
                console.warn(
                    "LiteGraph: there is already a node with this ID, changing it"
                );
                if (LiteGraph.use_uuids) {
                    node.id = LiteGraph.uuidv4();
                }
                else {
                    node.id = ++this.last_node_id;
                }
            }

            if (this._nodes.length >= LiteGraph.MAX_NUMBER_OF_NODES) {
                throw "LiteGraph: max number of nodes in a graph reached";
            }

            //give him an id
            if (LiteGraph.use_uuids) {
                if (node.id == null || node.id == -1)
                    node.id = LiteGraph.uuidv4();
            }
            else {
                if (node.id == null || node.id == -1) {
                    node.id = ++this.last_node_id;
                } else if (this.last_node_id < node.id) {
                    this.last_node_id = node.id;
                }
            }

            node.graph = this;
            this._version++;

            this._nodes.push(node);
            this._nodes_by_id[node.id] = node;

            if (node.onAdded) {
                node.onAdded(this);
            }

            if (this.config.align_to_grid) {
                node.alignToGrid();
            }

            if (!skip_compute_order) {
                this.updateExecutionOrder();
            }

            if (this.onNodeAdded) {
                this.onNodeAdded(node);
            }

            this.setDirtyCanvas(true);
            this.change();

            return node; //to chain actions
        }
        /**
             * Removes a node from the graph
             * @method remove
             * @param {LGraphNode} node the instance of the node
             */
        remove(node) {
            if (node.constructor === LiteGraph.LGraphGroup) {
                var index = this._groups.indexOf(node);
                if (index != -1) {
                    this._groups.splice(index, 1);
                }
                node.graph = null;
                this._version++;
                this.setDirtyCanvas(true, true);
                this.change();
                return;
            }

            if (this._nodes_by_id[node.id] == null) {
                return;
            } //not found

            if (node.ignore_remove) {
                return;
            } //cannot be removed

            this.beforeChange(); //sure? - almost sure is wrong


            //disconnect inputs
            if (node.inputs) {
                for (var i = 0; i < node.inputs.length; i++) {
                    var slot = node.inputs[i];
                    if (slot.link != null) {
                        node.disconnectInput(i);
                    }
                }
            }

            //disconnect outputs
            if (node.outputs) {
                for (var i = 0; i < node.outputs.length; i++) {
                    var slot = node.outputs[i];
                    if (slot.links != null && slot.links.length) {
                        node.disconnectOutput(i);
                    }
                }
            }

            //node.id = -1; //why?
            //callback
            if (node.onRemoved) {
                node.onRemoved();
            }

            node.graph = null;
            this._version++;

            //remove from canvas render
            if (this.list_of_graphcanvas) {
                for (var i = 0; i < this.list_of_graphcanvas.length; ++i) {
                    var canvas = this.list_of_graphcanvas[i];
                    if (canvas.selected_nodes[node.id]) {
                        delete canvas.selected_nodes[node.id];
                    }
                    if (canvas.node_dragged == node) {
                        canvas.node_dragged = null;
                    }
                }
            }

            //remove from containers
            var pos = this._nodes.indexOf(node);
            if (pos != -1) {
                this._nodes.splice(pos, 1);
            }
            delete this._nodes_by_id[node.id];

            if (this.onNodeRemoved) {
                this.onNodeRemoved(node);
            }

            //close panels
            this.sendActionToCanvas("checkPanels");

            this.setDirtyCanvas(true, true);
            this.afterChange(); //sure? - almost sure is wrong
            this.change();

            this.updateExecutionOrder();
        }
        /**
             * Returns a node by its id.
             * @method getNodeById
             * @param {Number} id
             */
        getNodeById(id) {
            if (id == null) {
                return null;
            }
            return this._nodes_by_id[id];
        }
        /**
             * Returns a list of nodes that matches a class
             * @method findNodesByClass
             * @param {Class} classObject the class itself (not an string)
             * @return {Array} a list with all the nodes of this type
             */
        findNodesByClass(classObject, result) {
            result = result || [];
            result.length = 0;
            for (var i = 0, l = this._nodes.length; i < l; ++i) {
                if (this._nodes[i].constructor === classObject) {
                    result.push(this._nodes[i]);
                }
            }
            return result;
        }
        /**
             * Returns a list of nodes that matches a type
             * @method findNodesByType
             * @param {String} type the name of the node type
             * @return {Array} a list with all the nodes of this type
             */
        findNodesByType(type, result) {
            var type = type.toLowerCase();
            result = result || [];
            result.length = 0;
            for (var i = 0, l = this._nodes.length; i < l; ++i) {
                if (this._nodes[i].type.toLowerCase() == type) {
                    result.push(this._nodes[i]);
                }
            }
            return result;
        }
        /**
             * Returns the first node that matches a name in its title
             * @method findNodeByTitle
             * @param {String} name the name of the node to search
             * @return {Node} the node or null
             */
        findNodeByTitle(title) {
            for (var i = 0, l = this._nodes.length; i < l; ++i) {
                if (this._nodes[i].title == title) {
                    return this._nodes[i];
                }
            }
            return null;
        }
        /**
             * Returns a list of nodes that matches a name
             * @method findNodesByTitle
             * @param {String} name the name of the node to search
             * @return {Array} a list with all the nodes with this name
             */
        findNodesByTitle(title) {
            var result = [];
            for (var i = 0, l = this._nodes.length; i < l; ++i) {
                if (this._nodes[i].title == title) {
                    result.push(this._nodes[i]);
                }
            }
            return result;
        }
        /**
             * Returns the top-most node in this position of the canvas
             * @method getNodeOnPos
             * @param {number} x the x coordinate in canvas space
             * @param {number} y the y coordinate in canvas space
             * @param {Array} nodes_list a list with all the nodes to search from, by default is all the nodes in the graph
             * @return {LGraphNode} the node at this position or null
             */
        getNodeOnPos(x, y, nodes_list, margin) {
            nodes_list = nodes_list || this._nodes;
            var nRet = null;
            for (var i = nodes_list.length - 1; i >= 0; i--) {
                var n = nodes_list[i];
                var skip_title = n.constructor.title_mode == LiteGraph.NO_TITLE;
                if (n.isPointInside(x, y, margin, skip_title)) {
                    // check for lesser interest nodes (TODO check for overlapping, use the top)
                    /*if (typeof n == "LGraphGroup"){
                        nRet = n;
                    }else{*/
                    return n;
                    /*}*/
                }
            }
            return nRet;
        }
        /**
             * Returns the top-most group in that position
             * @method getGroupOnPos
             * @param {number} x the x coordinate in canvas space
             * @param {number} y the y coordinate in canvas space
             * @return {LGraphGroup | null} the group or null
             */
        getGroupOnPos(x, y, {margin = 2} = {}) {
            return this._groups.reverse().find(g => g.isPointInside(x, y, margin, /* skip_title */true));
        }

        /**
             * Checks that the node type matches the node type registered, used when replacing a nodetype by a newer version during execution
             * this replaces the ones using the old version with the new version
             * @method checkNodeTypes
             */
        checkNodeTypes() {
            var changes = false;
            for (var i = 0; i < this._nodes.length; i++) {
                var node = this._nodes[i];
                var ctor = LiteGraph.registered_node_types[node.type];
                if (node.constructor == ctor) {
                    continue;
                }
                console.log("node being replaced by newer version: " + node.type);
                var newnode = LiteGraph.createNode(node.type);
                changes = true;
                this._nodes[i] = newnode;
                newnode.configure(node.serialize());
                newnode.graph = this;
                this._nodes_by_id[newnode.id] = newnode;
                if (node.inputs) {
                    newnode.inputs = node.inputs.concat();
                }
                if (node.outputs) {
                    newnode.outputs = node.outputs.concat();
                }
            }
            this.updateExecutionOrder();
        }
        // ********** GLOBALS *****************
        onAction(action, param, options) {
            this._input_nodes = this.findNodesByClass(
                LiteGraph.GraphInput,
                this._input_nodes
            );
            for (var i = 0; i < this._input_nodes.length; ++i) {
                var node = this._input_nodes[i];
                if (node.properties.name != action) {
                    continue;
                }
                //wrap node.onAction(action, param);
                node.actionDo(action, param, options);
                break;
            }
        }
        trigger(action, param) {
            if (this.onTrigger) {
                this.onTrigger(action, param);
            }
        }
        /**
             * Tell this graph it has a global graph input of this type
             * @method addGlobalInput
             * @param {String} name
             * @param {String} type
             * @param {*} value [optional]
             */
        addInput(name, type, value) {
            var input = this.inputs[name];
            if (input) {
                //already exist
                return;
            }

            this.beforeChange();
            this.inputs[name] = { name: name, type: type, value: value };
            this._version++;
            this.afterChange();

            if (this.onInputAdded) {
                this.onInputAdded(name, type);
            }

            if (this.onInputsOutputsChange) {
                this.onInputsOutputsChange();
            }
        }
        /**
             * Assign a data to the global graph input
             * @method setGlobalInputData
             * @param {String} name
             * @param {*} data
             */
        setInputData(name, data) {
            var input = this.inputs[name];
            if (!input) {
                return;
            }
            input.value = data;
        }
        /**
             * Returns the current value of a global graph input
             * @method getInputData
             * @param {String} name
             * @return {*} the data
             */
        getInputData(name) {
            var input = this.inputs[name];
            if (!input) {
                return null;
            }
            return input.value;
        }
        /**
             * Changes the name of a global graph input
             * @method renameInput
             * @param {String} old_name
             * @param {String} new_name
             */
        renameInput(old_name, name) {
            if (name == old_name) {
                return;
            }

            if (!this.inputs[old_name]) {
                return false;
            }

            if (this.inputs[name]) {
                console.error("there is already one input with that name");
                return false;
            }

            this.inputs[name] = this.inputs[old_name];
            delete this.inputs[old_name];
            this._version++;

            if (this.onInputRenamed) {
                this.onInputRenamed(old_name, name);
            }

            if (this.onInputsOutputsChange) {
                this.onInputsOutputsChange();
            }
        }
        /**
             * Changes the type of a global graph input
             * @method changeInputType
             * @param {String} name
             * @param {String} type
             */
        changeInputType(name, type) {
            if (!this.inputs[name]) {
                return false;
            }

            if (this.inputs[name].type &&
                String(this.inputs[name].type).toLowerCase() ==
                String(type).toLowerCase()) {
                return;
            }

            this.inputs[name].type = type;
            this._version++;
            if (this.onInputTypeChanged) {
                this.onInputTypeChanged(name, type);
            }
        }
        /**
             * Removes a global graph input
             * @method removeInput
             * @param {String} name
             * @param {String} type
             */
        removeInput(name) {
            if (!this.inputs[name]) {
                return false;
            }

            delete this.inputs[name];
            this._version++;

            if (this.onInputRemoved) {
                this.onInputRemoved(name);
            }

            if (this.onInputsOutputsChange) {
                this.onInputsOutputsChange();
            }
            return true;
        }
        /**
             * Creates a global graph output
             * @method addOutput
             * @param {String} name
             * @param {String} type
             * @param {*} value
             */
        addOutput(name, type, value) {
            this.outputs[name] = { name: name, type: type, value: value };
            this._version++;

            if (this.onOutputAdded) {
                this.onOutputAdded(name, type);
            }

            if (this.onInputsOutputsChange) {
                this.onInputsOutputsChange();
            }
        }
        /**
             * Assign a data to the global output
             * @method setOutputData
             * @param {String} name
             * @param {String} value
             */
        setOutputData(name, value) {
            var output = this.outputs[name];
            if (!output) {
                return;
            }
            output.value = value;
        }
        /**
             * Returns the current value of a global graph output
             * @method getOutputData
             * @param {String} name
             * @return {*} the data
             */
        getOutputData(name) {
            var output = this.outputs[name];
            if (!output) {
                return null;
            }
            return output.value;
        }
        /**
             * Renames a global graph output
             * @method renameOutput
             * @param {String} old_name
             * @param {String} new_name
             */
        renameOutput(old_name, name) {
            if (!this.outputs[old_name]) {
                return false;
            }

            if (this.outputs[name]) {
                console.error("there is already one output with that name");
                return false;
            }

            this.outputs[name] = this.outputs[old_name];
            delete this.outputs[old_name];
            this._version++;

            if (this.onOutputRenamed) {
                this.onOutputRenamed(old_name, name);
            }

            if (this.onInputsOutputsChange) {
                this.onInputsOutputsChange();
            }
        }
        /**
             * Changes the type of a global graph output
             * @method changeOutputType
             * @param {String} name
             * @param {String} type
             */
        changeOutputType(name, type) {
            if (!this.outputs[name]) {
                return false;
            }

            if (this.outputs[name].type &&
                String(this.outputs[name].type).toLowerCase() ==
                String(type).toLowerCase()) {
                return;
            }

            this.outputs[name].type = type;
            this._version++;
            if (this.onOutputTypeChanged) {
                this.onOutputTypeChanged(name, type);
            }
        }
        /**
             * Removes a global graph output
             * @method removeOutput
             * @param {String} name
             */
        removeOutput(name) {
            if (!this.outputs[name]) {
                return false;
            }
            delete this.outputs[name];
            this._version++;

            if (this.onOutputRemoved) {
                this.onOutputRemoved(name);
            }

            if (this.onInputsOutputsChange) {
                this.onInputsOutputsChange();
            }
            return true;
        }
        triggerInput(name, value) {
            var nodes = this.findNodesByTitle(name);
            for (var i = 0; i < nodes.length; ++i) {
                nodes[i].onTrigger(value);
            }
        }
        setCallback(name, func) {
            var nodes = this.findNodesByTitle(name);
            for (var i = 0; i < nodes.length; ++i) {
                nodes[i].setTrigger(func);
            }
        }
        //used for undo, called before any change is made to the graph
        beforeChange(info) {
            if (this.onBeforeChange) {
                this.onBeforeChange(this, info);
            }
            this.sendActionToCanvas("onBeforeChange", this);
        }
        //used to resend actions, called after any change is made to the graph
        afterChange(info) {
            if (this.onAfterChange) {
                this.onAfterChange(this, info);
            }
            this.sendActionToCanvas("onAfterChange", this);
        }
        connectionChange(node, link_info) {
            this.updateExecutionOrder();
            if (this.onConnectionChange) {
                this.onConnectionChange(node);
            }
            this._version++;
            this.sendActionToCanvas("onConnectionChange");
        }
        /**
             * returns if the graph is in live mode
             * @method isLive
             */
        isLive() {
            if (!this.list_of_graphcanvas) {
                return false;
            }

            for (var i = 0; i < this.list_of_graphcanvas.length; ++i) {
                var c = this.list_of_graphcanvas[i];
                if (c.live_mode) {
                    return true;
                }
            }
            return false;
        }
        /**
             * clears the triggered slot animation in all links (stop visual animation)
             * @method clearTriggeredSlots
             */
        clearTriggeredSlots() {
            for (var i in this.links) {
                var link_info = this.links[i];
                if (!link_info) {
                    continue;
                }
                if (link_info._last_time) {
                    link_info._last_time = 0;
                }
            }
        }
        /* Called when something visually changed (not the graph!) */
        change() {
            if (LiteGraph.debug) {
                console.log("Graph changed");
            }
            this.sendActionToCanvas("setDirty", [true, true]);
            if (this.on_change) {
                this.on_change(this);
            }
        }
        setDirtyCanvas(fg, bg) {
            this.sendActionToCanvas("setDirty", [fg, bg]);
        }
        /**
             * Destroys a link
             * @method removeLink
             * @param {Number} link_id
             */
        removeLink(link_id) {
            var link = this.links[link_id];
            if (!link) {
                return;
            }
            var node = this.getNodeById(link.target_id);
            if (node) {
                node.disconnectInput(link.target_slot);
            }
        }
        //save and recover app state ***************************************
        /**
             * Creates a Object containing all the info about this graph, it can be serialized
             * @method serialize
             * @return {Object} value of the node
             */
        serialize(option = { sortNodes: false }) {
            var nodes_info = [];
            nodes_info = (
                option?.sortNodes ?
                [...this._nodes].sort((a, b) => a.id - b.id) :
                this._nodes
            ).map(node => node.serialize());

            //pack link info into a non-verbose format
            var links = [];
            for (var i in this.links) {
                //links is an OBJECT
                var link = this.links[i];
                if (!link.serialize) {
                    //weird bug I havent solved yet
                    console.warn(
                        "weird LLink bug, link info is not a LLink but a regular object"
                    );
                    var link2 = new LLink();
                    for (var j in link) {
                        link2[j] = link[j];
                    }
                    this.links[i] = link2;
                    link = link2;
                }

                links.push(link.serialize());
            }

            var groups_info = [];
            for (var i = 0; i < this._groups.length; ++i) {
                groups_info.push(this._groups[i].serialize());
            }

            var data = {
                last_node_id: this.last_node_id,
                last_link_id: this.last_link_id,
                nodes: nodes_info,
                links: links,
                groups: groups_info,
                config: this.config,
                extra: this.extra,
                version: LiteGraph.VERSION
            };

            if (this.onSerialize)
                this.onSerialize(data);

            return data;
        }
        /**
             * Configure a graph from a JSON string
             * @method configure
             * @param {String} str configure a graph from a JSON string
             * @param {Boolean} returns if there was any error parsing
             */
        configure(data, keep_old) {
            if (!data) {
                return;
            }

            if (!keep_old) {
                this.clear();
            }

            var nodes = data.nodes;

            //decode links info (they are very verbose)
            if (data.links && data.links.constructor === Array) {
                var links = [];
                for (var i = 0; i < data.links.length; ++i) {
                    var link_data = data.links[i];
                    if (!link_data) //weird bug
                    {
                        console.warn("serialized graph link data contains errors, skipping.");
                        continue;
                    }
                    var link = new LLink();
                    link.configure(link_data);
                    links[link.id] = link;
                }
                data.links = links;
            }

            //copy all stored fields
            for (var i in data) {
                if (i == "nodes" || i == "groups") //links must be accepted
                    continue;

                this[i] = data[i];
            }

            var error = false;

            //create nodes
            this._nodes = [];
            if (nodes) {
                for (var i = 0, l = nodes.length; i < l; ++i) {
                    var n_info = nodes[i]; //stored info
                    var node = LiteGraph.createNode(n_info.type, n_info.title);
                    if (!node) {
                        if (LiteGraph.debug) {
                            console.log(
                                "Node not found or has errors: " + n_info.type
                            );
                        }

                        //in case of error we create a replacement node to avoid losing info
                        node = new LGraphNode();
                        node.last_serialization = n_info;
                        node.has_errors = true;
                        error = true;
                        //continue;
                    }

                    node.id = n_info.id; //id it or it will create a new id
                    this.add(node, true); //add before configure, otherwise configure cannot create links
                }

                //configure nodes afterwards so they can reach each other
                for (var i = 0, l = nodes.length; i < l; ++i) {
                    var n_info = nodes[i];
                    var node = this.getNodeById(n_info.id);
                    if (node) {
                        node.configure(n_info);
                    }
                }
            }

            //groups
            this._groups.length = 0;
            if (data.groups) {
                for (var i = 0; i < data.groups.length; ++i) {
                    var group = new LiteGraph.LGraphGroup();
                    group.configure(data.groups[i]);
                    this.add(group);
                }
            }

            this.updateExecutionOrder();

            this.extra = data.extra || {};

            if (this.onConfigure)
                this.onConfigure(data);

            this._version++;
            this.setDirtyCanvas(true, true);
            return error;
        }
        load(url, callback) {
            var that = this;

            //from file
            if (url.constructor === File || url.constructor === Blob) {
                var reader = new FileReader();
                reader.addEventListener('load', function (event) {
                    var data = JSON.parse(event.target.result);
                    that.configure(data);
                    if (callback)
                        callback();
                });

                reader.readAsText(url);
                return;
            }

            //is a string, then an URL
            var req = new XMLHttpRequest();
            req.open("GET", url, true);
            req.send(null);
            req.onload = function (oEvent) {
                if (req.status !== 200) {
                    console.error("Error loading graph:", req.status, req.response);
                    return;
                }
                var data = JSON.parse(req.response);
                that.configure(data);
                if (callback)
                    callback();
            };
            req.onerror = function (err) {
                console.error("Error loading graph:", err);
            };
        }
        onNodeTrace(node, msg, color) {
            //TODO
        }
    }
    globalThis.LGraph = LiteGraph.LGraph = LGraph;

    //this is the class in charge of storing link information
    class LLink {
        constructor(id, type, origin_id, origin_slot, target_id, target_slot) {
            this.id = id;
            this.type = type;
            this.origin_id = origin_id;
            this.origin_slot = origin_slot;
            this.target_id = target_id;
            this.target_slot = target_slot;

            this._data = null;
            this._pos = new Float32Array(2); //center
        }
        configure(o) {
            if (o.constructor === Array) {
                this.id = o[0];
                this.origin_id = o[1];
                this.origin_slot = o[2];
                this.target_id = o[3];
                this.target_slot = o[4];
                this.type = o[5];
            } else {
                this.id = o.id;
                this.type = o.type;
                this.origin_id = o.origin_id;
                this.origin_slot = o.origin_slot;
                this.target_id = o.target_id;
                this.target_slot = o.target_slot;
            }
        }
        serialize() {
            return [
                this.id,
                this.origin_id,
                this.origin_slot,
                this.target_id,
                this.target_slot,
                this.type
            ];
        }
    }

    LiteGraph.LLink = LLink;

    // *************************************************************
    //   Node CLASS                                          *******
    // *************************************************************

    /*
	title: string
	pos: [x,y]
	size: [x,y]

	input|output: every connection
		+  { name:string, type:string, pos: [x,y]=Optional, direction: "input"|"output", links: Array });

	general properties:
		+ clip_area: if you render outside the node, it will be clipped
		+ unsafe_execution: not allowed for safe execution
		+ skip_repeated_outputs: when adding new outputs, it wont show if there is one already connected
		+ resizable: if set to false it wont be resizable with the mouse
		+ horizontal: slots are distributed horizontally
		+ widgets_start_y: widgets start at y distance from the top of the node
	
	flags object:
		+ collapsed: if it is collapsed

	supported callbacks:
		+ onAdded: when added to graph (warning: this is called BEFORE the node is configured when loading)
		+ onRemoved: when removed from graph
		+ onStart:	when the graph starts playing
		+ onStop:	when the graph stops playing
		+ onDrawForeground: render the inside widgets inside the node
		+ onDrawBackground: render the background area inside the node (only in edit mode)
		+ onMouseDown
		+ onMouseMove
		+ onMouseUp
		+ onMouseEnter
		+ onMouseLeave
		+ onExecute: execute the node
		+ onPropertyChanged: when a property is changed in the panel (return true to skip default behaviour)
		+ onGetInputs: returns an array of possible inputs
		+ onGetOutputs: returns an array of possible outputs
		+ onBounding: in case this node has a bigger bounding than the node itself (the callback receives the bounding as [x,y,w,h])
		+ onDblClick: double clicked in the node
		+ onNodeTitleDblClick: double clicked in the node title
		+ onInputDblClick: input slot double clicked (can be used to automatically create a node connected)
		+ onOutputDblClick: output slot double clicked (can be used to automatically create a node connected)
		+ onConfigure: called after the node has been configured
		+ onSerialize: to add extra info when serializing (the callback receives the object that should be filled with the data)
		+ onSelected
		+ onDeselected
		+ onDropItem : DOM item dropped over the node
		+ onDropFile : file dropped over the node
		+ onConnectInput : if returns false the incoming connection will be canceled
		+ onConnectionsChange : a connection changed (new one or removed) (LiteGraph.INPUT or LiteGraph.OUTPUT, slot, true if connected, link_info, input_info )
		+ onAction: action slot triggered
		+ getExtraMenuOptions: to add option to context menu
*/

    /**
     * Base Class for all the node type classes
     * @class LGraphNode
     * @param {String} name a name for the node
     */

    class LGraphNode {

        constructor(title) {
            this._ctor(title);
        }

        _ctor(title) {
            this.title = title || "Unnamed";
            this.size = [LiteGraph.NODE_WIDTH, 60];
            this.graph = null;
            // Initialize _pos with a Float32Array of length 2, default value [10, 10]
            this._pos = new Float32Array([10, 10]);

            Object.defineProperty(this, "pos", {
                set: function (v) {
                    if (!v || v.length < 2) {
                        return;
                    }
                    this._pos[0] = v[0];
                    this._pos[1] = v[1];
                },
                get: function () {
                    return this._pos;
                },
                enumerable: true
            });

            if (LiteGraph.use_uuids) {
                this.id = LiteGraph.uuidv4();
            }
            else {
                this.id = -1; //not know till not added
            }
            this.type = null;

            //inputs available: array of inputs
            this.inputs = [];
            this.outputs = [];
            this.connections = [];
            this.badges = [];
            this.badgePosition = BadgePosition.TopLeft;

            //local data
            this.properties = {}; //for the values
            this.properties_info = []; //for the info

            this.flags = {};
        }

        /**
             * configure a node from an object containing the serialized info
             * @method configure
             */
        configure(info) {
            if (this.graph) {
                this.graph._version++;
            }
            for (var j in info) {
                if (j == "properties") {
                    //i don't want to clone properties, I want to reuse the old container
                    for (var k in info.properties) {
                        this.properties[k] = info.properties[k];
                        if (this.onPropertyChanged) {
                            this.onPropertyChanged(k, info.properties[k]);
                        }
                    }
                    continue;
                }

                if (info[j] == null) {
                    continue;
                } else if (typeof info[j] == "object") {
                    //object
                    if (this[j] && this[j].configure) {
                        this[j].configure(info[j]);
                    } else {
                        this[j] = LiteGraph.cloneObject(info[j], this[j]);
                    }
                } //value
                else {
                    this[j] = info[j];
                }
            }

            if (!info.title) {
                this.title = this.constructor.title;
            }

            if (this.inputs) {
                for (var i = 0; i < this.inputs.length; ++i) {
                    var input = this.inputs[i];
                    var link_info = this.graph ? this.graph.links[input.link] : null;
                    if (this.onConnectionsChange)
                        this.onConnectionsChange(LiteGraph.INPUT, i, true, link_info, input); //link_info has been created now, so its updated

                    if (this.onInputAdded)
                        this.onInputAdded(input);

                }
            }

            if (this.outputs) {
                for (var i = 0; i < this.outputs.length; ++i) {
                    var output = this.outputs[i];
                    if (!output.links) {
                        continue;
                    }
                    for (var j = 0; j < output.links.length; ++j) {
                        var link_info = this.graph ? this.graph.links[output.links[j]] : null;
                        if (this.onConnectionsChange)
                            this.onConnectionsChange(LiteGraph.OUTPUT, i, true, link_info, output); //link_info has been created now, so its updated
                    }

                    if (this.onOutputAdded)
                        this.onOutputAdded(output);
                }
            }

            if (this.widgets) {
                for (var i = 0; i < this.widgets.length; ++i) {
                    var w = this.widgets[i];
                    if (!w)
                        continue;
                    if (w.options && w.options.property && (this.properties[w.options.property] != undefined))
                        w.value = JSON.parse(JSON.stringify(this.properties[w.options.property]));
                }
                if (info.widgets_values) {
                    for (var i = 0; i < info.widgets_values.length; ++i) {
                        if (this.widgets[i]) {
                            this.widgets[i].value = info.widgets_values[i];
                        }
                    }
                }
            }

            // Sync the state of this.resizable.
            if (this.pinned) {
                this.pin(true);
            }

            if (this.onConfigure) {
                this.onConfigure(info);
            }
        }

        /**
             * serialize the content
             * @method serialize
             */
        serialize() {
            //create serialization object
            var o = {
                id: this.id,
                type: this.type,
                pos: this.pos,
                size: this.size,
                flags: LiteGraph.cloneObject(this.flags),
                order: this.order,
                mode: this.mode
            };

            //special case for when there were errors
            if (this.constructor === LGraphNode && this.last_serialization) {
                return this.last_serialization;
            }

            if (this.inputs) {
                o.inputs = this.inputs;
            }

            if (this.outputs) {
                //clear outputs last data (because data in connections is never serialized but stored inside the outputs info)
                for (var i = 0; i < this.outputs.length; i++) {
                    delete this.outputs[i]._data;
                }
                o.outputs = this.outputs;
            }

            if (this.title && this.title != this.constructor.title) {
                o.title = this.title;
            }

            if (this.properties) {
                o.properties = LiteGraph.cloneObject(this.properties);
            }

            if (this.widgets && this.serialize_widgets) {
                o.widgets_values = [];
                for (var i = 0; i < this.widgets.length; ++i) {
                    if (this.widgets[i])
                        o.widgets_values[i] = this.widgets[i].value;

                    else
                        o.widgets_values[i] = null;
                }
            }

            if (!o.type) {
                o.type = this.constructor.type;
            }

            if (this.color) {
                o.color = this.color;
            }
            if (this.bgcolor) {
                o.bgcolor = this.bgcolor;
            }
            if (this.boxcolor) {
                o.boxcolor = this.boxcolor;
            }
            if (this.shape) {
                o.shape = this.shape;
            }

            if (this.onSerialize) {
                if (this.onSerialize(o)) {
                    console.warn(
                        "node onSerialize shouldnt return anything, data should be stored in the object pass in the first parameter"
                    );
                }
            }

            return o;
        }

        /* Creates a clone of this node */
        clone() {
            var node = LiteGraph.createNode(this.type);
            if (!node) {
                return null;
            }

            //we clone it because serialize returns shared containers
            var data = LiteGraph.cloneObject(this.serialize());

            //remove links
            if (data.inputs) {
                for (var i = 0; i < data.inputs.length; ++i) {
                    data.inputs[i].link = null;
                }
            }

            if (data.outputs) {
                for (var i = 0; i < data.outputs.length; ++i) {
                    if (data.outputs[i].links) {
                        data.outputs[i].links.length = 0;
                    }
                }
            }

            delete data["id"];

            if (LiteGraph.use_uuids) {
                data["id"] = LiteGraph.uuidv4();
            }

            //remove links
            node.configure(data);

            return node;
        }

        /**
             * serialize and stringify
             * @method toString
             */
        toString() {
            return JSON.stringify(this.serialize());
        }

        //LGraphNode.prototype.deserialize = function(info) {} //this cannot be done from within, must be done in LiteGraph
        /**
             * get the title string
             * @method getTitle
             */
        getTitle() {
            return this.title || this.constructor.title;
        }

        /**
             * sets the value of a property
             * @method setProperty
             * @param {String} name
             * @param {*} value
             */
        setProperty(name, value) {
            if (!this.properties) {
                this.properties = {};
            }
            if (value === this.properties[name])
                return;
            var prev_value = this.properties[name];
            this.properties[name] = value;
            if (this.onPropertyChanged) {
                if (this.onPropertyChanged(name, value, prev_value) === false) //abort change
                    this.properties[name] = prev_value;
            }
            if (this.widgets) //widgets could be linked to properties
                for (var i = 0; i < this.widgets.length; ++i) {
                    var w = this.widgets[i];
                    if (!w)
                        continue;
                    if (w.options.property == name) {
                        w.value = value;
                        break;
                    }
                }
        }

        // Execution *************************
        /**
             * sets the output data
             * @method setOutputData
             * @param {number} slot
             * @param {*} data
             */
        setOutputData(slot, data) {
            if (!this.outputs) {
                return;
            }

            //this maybe slow and a niche case
            //if(slot && slot.constructor === String)
            //	slot = this.findOutputSlot(slot);
            if (slot == -1 || slot >= this.outputs.length) {
                return;
            }

            var output_info = this.outputs[slot];
            if (!output_info) {
                return;
            }

            //store data in the output itself in case we want to debug
            output_info._data = data;

            //if there are connections, pass the data to the connections
            if (this.outputs[slot].links) {
                for (var i = 0; i < this.outputs[slot].links.length; i++) {
                    var link_id = this.outputs[slot].links[i];
                    var link = this.graph.links[link_id];
                    if (link)
                        link.data = data;
                }
            }
        }

        /**
             * sets the output data type, useful when you want to be able to overwrite the data type
             * @method setOutputDataType
             * @param {number} slot
             * @param {String} datatype
             */
        setOutputDataType(slot, type) {
            if (!this.outputs) {
                return;
            }
            if (slot == -1 || slot >= this.outputs.length) {
                return;
            }
            var output_info = this.outputs[slot];
            if (!output_info) {
                return;
            }
            //store data in the output itself in case we want to debug
            output_info.type = type;

            //if there are connections, pass the data to the connections
            if (this.outputs[slot].links) {
                for (var i = 0; i < this.outputs[slot].links.length; i++) {
                    var link_id = this.outputs[slot].links[i];
                    this.graph.links[link_id].type = type;
                }
            }
        }

        /**
             * Retrieves the input data (data traveling through the connection) from one slot
             * @method getInputData
             * @param {number} slot
             * @param {boolean} force_update if set to true it will force the connected node of this slot to output data into this link
             * @return {*} data or if it is not connected returns undefined
             */
        getInputData(slot, force_update) {
            if (!this.inputs) {
                return;
            } //undefined;

            if (slot >= this.inputs.length || this.inputs[slot].link == null) {
                return;
            }

            var link_id = this.inputs[slot].link;
            var link = this.graph.links[link_id];
            if (!link) {
                //bug: weird case but it happens sometimes
                return null;
            }

            if (!force_update) {
                return link.data;
            }

            //special case: used to extract data from the incoming connection before the graph has been executed
            var node = this.graph.getNodeById(link.origin_id);
            if (!node) {
                return link.data;
            }

            if (node.updateOutputData) {
                node.updateOutputData(link.origin_slot);
            } else if (node.onExecute) {
                node.onExecute();
            }

            return link.data;
        }

        /**
             * Retrieves the input data type (in case this supports multiple input types)
             * @method getInputDataType
             * @param {number} slot
             * @return {String} datatype in string format
             */
        getInputDataType(slot) {
            if (!this.inputs) {
                return null;
            } //undefined;

            if (slot >= this.inputs.length || this.inputs[slot].link == null) {
                return null;
            }
            var link_id = this.inputs[slot].link;
            var link = this.graph.links[link_id];
            if (!link) {
                //bug: weird case but it happens sometimes
                return null;
            }
            var node = this.graph.getNodeById(link.origin_id);
            if (!node) {
                return link.type;
            }
            var output_info = node.outputs[link.origin_slot];
            if (output_info) {
                return output_info.type;
            }
            return null;
        }

        /**
             * Retrieves the input data from one slot using its name instead of slot number
             * @method getInputDataByName
             * @param {String} slot_name
             * @param {boolean} force_update if set to true it will force the connected node of this slot to output data into this link
             * @return {*} data or if it is not connected returns null
             */
        getInputDataByName(slot_name,
            force_update) {
            var slot = this.findInputSlot(slot_name);
            if (slot == -1) {
                return null;
            }
            return this.getInputData(slot, force_update);
        }

        /**
             * tells you if there is a connection in one input slot
             * @method isInputConnected
             * @param {number} slot
             * @return {boolean}
             */
        isInputConnected(slot) {
            if (!this.inputs) {
                return false;
            }
            return slot < this.inputs.length && this.inputs[slot].link != null;
        }

        /**
             * tells you info about an input connection (which node, type, etc)
             * @method getInputInfo
             * @param {number} slot
             * @return {Object} object or null { link: id, name: string, type: string or 0 }
             */
        getInputInfo(slot) {
            if (!this.inputs) {
                return null;
            }
            if (slot < this.inputs.length) {
                return this.inputs[slot];
            }
            return null;
        }

        /**
             * Returns the link info in the connection of an input slot
             * @method getInputLink
             * @param {number} slot
             * @return {LLink} object or null
             */
        getInputLink(slot) {
            if (!this.inputs) {
                return null;
            }
            if (slot < this.inputs.length) {
                var slot_info = this.inputs[slot];
                return this.graph.links[slot_info.link];
            }
            return null;
        }

        /**
             * returns the node connected in the input slot
             * @method getInputNode
             * @param {number} slot
             * @return {LGraphNode} node or null
             */
        getInputNode(slot) {
            if (!this.inputs) {
                return null;
            }
            if (slot >= this.inputs.length) {
                return null;
            }
            var input = this.inputs[slot];
            if (!input || input.link === null) {
                return null;
            }
            var link_info = this.graph.links[input.link];
            if (!link_info) {
                return null;
            }
            return this.graph.getNodeById(link_info.origin_id);
        }

        /**
             * returns the value of an input with this name, otherwise checks if there is a property with that name
             * @method getInputOrProperty
             * @param {string} name
             * @return {*} value
             */
        getInputOrProperty(name) {
            if (!this.inputs || !this.inputs.length) {
                return this.properties ? this.properties[name] : null;
            }

            for (var i = 0, l = this.inputs.length; i < l; ++i) {
                var input_info = this.inputs[i];
                if (name == input_info.name && input_info.link != null) {
                    var link = this.graph.links[input_info.link];
                    if (link) {
                        return link.data;
                    }
                }
            }
            return this.properties[name];
        }

        /**
             * tells you the last output data that went in that slot
             * @method getOutputData
             * @param {number} slot
             * @return {Object}  object or null
             */
        getOutputData(slot) {
            if (!this.outputs) {
                return null;
            }
            if (slot >= this.outputs.length) {
                return null;
            }

            var info = this.outputs[slot];
            return info._data;
        }

        /**
             * tells you info about an output connection (which node, type, etc)
             * @method getOutputInfo
             * @param {number} slot
             * @return {Object}  object or null { name: string, type: string, links: [ ids of links in number ] }
             */
        getOutputInfo(slot) {
            if (!this.outputs) {
                return null;
            }
            if (slot < this.outputs.length) {
                return this.outputs[slot];
            }
            return null;
        }

        /**
             * tells you if there is a connection in one output slot
             * @method isOutputConnected
             * @param {number} slot
             * @return {boolean}
             */
        isOutputConnected(slot) {
            if (!this.outputs) {
                return false;
            }
            return (
                slot < this.outputs.length &&
                this.outputs[slot].links &&
                this.outputs[slot].links.length
            );
        }

        /**
             * tells you if there is any connection in the output slots
             * @method isAnyOutputConnected
             * @return {boolean}
             */
        isAnyOutputConnected() {
            if (!this.outputs) {
                return false;
            }
            for (var i = 0; i < this.outputs.length; ++i) {
                if (this.outputs[i].links && this.outputs[i].links.length) {
                    return true;
                }
            }
            return false;
        }

        /**
             * retrieves all the nodes connected to this output slot
             * @method getOutputNodes
             * @param {number} slot
             * @return {array}
             */
        getOutputNodes(slot) {
            if (!this.outputs || this.outputs.length == 0) {
                return null;
            }

            if (slot >= this.outputs.length) {
                return null;
            }

            var output = this.outputs[slot];
            if (!output.links || output.links.length == 0) {
                return null;
            }

            var r = [];
            for (var i = 0; i < output.links.length; i++) {
                var link_id = output.links[i];
                var link = this.graph.links[link_id];
                if (link) {
                    var target_node = this.graph.getNodeById(link.target_id);
                    if (target_node) {
                        r.push(target_node);
                    }
                }
            }
            return r;
        }

        addOnTriggerInput() {
            var trigS = this.findInputSlot("onTrigger");
            if (trigS == -1) { //!trigS || 
                var input = this.addInput("onTrigger", LiteGraph.EVENT, { optional: true, nameLocked: true });
                return this.findInputSlot("onTrigger");
            }
            return trigS;
        }

        addOnExecutedOutput() {
            var trigS = this.findOutputSlot("onExecuted");
            if (trigS == -1) { //!trigS || 
                var output = this.addOutput("onExecuted", LiteGraph.ACTION, { optional: true, nameLocked: true });
                return this.findOutputSlot("onExecuted");
            }
            return trigS;
        }

        onAfterExecuteNode(param, options) {
            var trigS = this.findOutputSlot("onExecuted");
            if (trigS != -1) {

                //console.debug(this.id+":"+this.order+" triggering slot onAfterExecute");
                //console.debug(param);
                //console.debug(options);
                this.triggerSlot(trigS, param, null, options);

            }
        }

        changeMode(modeTo) {
            switch (modeTo) {
                case LiteGraph.ON_EVENT:
                    // this.addOnExecutedOutput();
                    break;

                case LiteGraph.ON_TRIGGER:
                    this.addOnTriggerInput();
                    this.addOnExecutedOutput();
                    break;

                case LiteGraph.NEVER:
                    break;

                case LiteGraph.ALWAYS:
                    break;

                case LiteGraph.ON_REQUEST:
                    break;

                default:
                    return false;
                    break;
            }
            this.mode = modeTo;
            return true;
        }

        /**
             * Triggers the node code execution, place a boolean/counter to mark the node as being executed
             * @method execute
             * @param {*} param
             * @param {*} options
             */
        doExecute(param, options) {
            options = options || {};
            if (this.onExecute) {

                // enable this to give the event an ID
                if (!options.action_call) options.action_call = this.id + "_exec_" + Math.floor(Math.random() * 9999);

                this.graph.nodes_executing[this.id] = true; //.push(this.id);

                this.onExecute(param, options);

                this.graph.nodes_executing[this.id] = false; //.pop();


                // save execution/action ref
                this.exec_version = this.graph.iteration;
                if (options && options.action_call) {
                    this.action_call = options.action_call; // if (param)
                    this.graph.nodes_executedAction[this.id] = options.action_call;
                }
            }
            this.execute_triggered = 2; // the nFrames it will be used (-- each step), means "how old" is the event
            if (this.onAfterExecuteNode) this.onAfterExecuteNode(param, options); // callback
        }

        /**
             * Triggers an action, wrapped by logics to control execution flow
             * @method actionDo
             * @param {String} action name
             * @param {*} param
             */
        actionDo(action, param, options) {
            options = options || {};
            if (this.onAction) {

                // enable this to give the event an ID
                if (!options.action_call) options.action_call = this.id + "_" + (action ? action : "action") + "_" + Math.floor(Math.random() * 9999);

                this.graph.nodes_actioning[this.id] = (action ? action : "actioning"); //.push(this.id);

                this.onAction(action, param, options);

                this.graph.nodes_actioning[this.id] = false; //.pop();


                // save execution/action ref
                if (options && options.action_call) {
                    this.action_call = options.action_call; // if (param)
                    this.graph.nodes_executedAction[this.id] = options.action_call;
                }
            }
            this.action_triggered = 2; // the nFrames it will be used (-- each step), means "how old" is the event
            if (this.onAfterExecuteNode) this.onAfterExecuteNode(param, options);
        }

        /**
             * Triggers an event in this node, this will trigger any output with the same name
             * @method trigger
             * @param {String} event name ( "on_play", ... ) if action is equivalent to false then the event is send to all
             * @param {*} param
             */
        trigger(action, param, options) {
            if (!this.outputs || !this.outputs.length) {
                return;
            }

            if (this.graph)
                this.graph._last_trigger_time = LiteGraph.getTime();

            for (var i = 0; i < this.outputs.length; ++i) {
                var output = this.outputs[i];
                if (!output || output.type !== LiteGraph.EVENT || (action && output.name != action))
                    continue;
                this.triggerSlot(i, param, null, options);
            }
        }

        /**
             * Triggers a slot event in this node: cycle output slots and launch execute/action on connected nodes
             * @method triggerSlot
             * @param {Number} slot the index of the output slot
             * @param {*} param
             * @param {Number} link_id [optional] in case you want to trigger and specific output link in a slot
             */
        triggerSlot(slot, param, link_id, options) {
            options = options || {};
            if (!this.outputs) {
                return;
            }

            if (slot == null) {
                console.error("slot must be a number");
                return;
            }

            if (slot.constructor !== Number)
                console.warn("slot must be a number, use node.trigger('name') if you want to use a string");

            var output = this.outputs[slot];
            if (!output) {
                return;
            }

            var links = output.links;
            if (!links || !links.length) {
                return;
            }

            if (this.graph) {
                this.graph._last_trigger_time = LiteGraph.getTime();
            }

            //for every link attached here
            for (var k = 0; k < links.length; ++k) {
                var id = links[k];
                if (link_id != null && link_id != id) {
                    //to skip links
                    continue;
                }
                var link_info = this.graph.links[links[k]];
                if (!link_info) {
                    //not connected
                    continue;
                }
                link_info._last_time = LiteGraph.getTime();
                var node = this.graph.getNodeById(link_info.target_id);
                if (!node) {
                    //node not found?
                    continue;
                }

                //used to mark events in graph
                var target_connection = node.inputs[link_info.target_slot];

                if (node.mode === LiteGraph.ON_TRIGGER) {
                    // generate unique trigger ID if not present
                    if (!options.action_call) options.action_call = this.id + "_trigg_" + Math.floor(Math.random() * 9999);
                    if (node.onExecute) {
                        // -- wrapping node.onExecute(param); --
                        node.doExecute(param, options);
                    }
                }
                else if (node.onAction) {
                    // generate unique action ID if not present
                    if (!options.action_call) options.action_call = this.id + "_act_" + Math.floor(Math.random() * 9999);
                    //pass the action name
                    var target_connection = node.inputs[link_info.target_slot];
                    // wrap node.onAction(target_connection.name, param);
                    node.actionDo(target_connection.name, param, options);
                }
            }
        }

        /**
             * clears the trigger slot animation
             * @method clearTriggeredSlot
             * @param {Number} slot the index of the output slot
             * @param {Number} link_id [optional] in case you want to trigger and specific output link in a slot
             */
        clearTriggeredSlot(slot, link_id) {
            if (!this.outputs) {
                return;
            }

            var output = this.outputs[slot];
            if (!output) {
                return;
            }

            var links = output.links;
            if (!links || !links.length) {
                return;
            }

            //for every link attached here
            for (var k = 0; k < links.length; ++k) {
                var id = links[k];
                if (link_id != null && link_id != id) {
                    //to skip links
                    continue;
                }
                var link_info = this.graph.links[links[k]];
                if (!link_info) {
                    //not connected
                    continue;
                }
                link_info._last_time = 0;
            }
        }

        /**
             * changes node size and triggers callback
             * @method setSize
             * @param {vec2} size
             */
        setSize(size) {
            this.size = size;
            if (this.onResize)
                this.onResize(this.size);
        }

        /**
             * add a new property to this node
             * @method addProperty
             * @param {string} name
             * @param {*} default_value
             * @param {string} type string defining the output type ("vec3","number",...)
             * @param {Object} extra_info this can be used to have special properties of the property (like values, etc)
             */
        addProperty(name,
            default_value,
            type,
            extra_info) {
            var o = { name: name, type: type, default_value: default_value };
            if (extra_info) {
                for (var i in extra_info) {
                    o[i] = extra_info[i];
                }
            }
            if (!this.properties_info) {
                this.properties_info = [];
            }
            this.properties_info.push(o);
            if (!this.properties) {
                this.properties = {};
            }
            this.properties[name] = default_value;
            return o;
        }

        //connections
        /**
             * add a new output slot to use in this node
             * @method addOutput
             * @param {string} name
             * @param {string} type string defining the output type ("vec3","number",...)
             * @param {Object} extra_info this can be used to have special properties of an output (label, special color, position, etc)
             */
        addOutput(name, type, extra_info) {
            var output = { name: name, type: type, links: null };
            if (extra_info) {
                for (var i in extra_info) {
                    output[i] = extra_info[i];
                }
            }

            if (!this.outputs) {
                this.outputs = [];
            }
            this.outputs.push(output);
            if (this.onOutputAdded) {
                this.onOutputAdded(output);
            }

            if (LiteGraph.auto_load_slot_types) LiteGraph.registerNodeAndSlotType(this, type, true);

            this.setSize(this.computeSize());
            this.setDirtyCanvas(true, true);
            return output;
        }

        /**
             * add a new output slot to use in this node
             * @method addOutputs
             * @param {Array} array of triplets like [[name,type,extra_info],[...]]
             */
        addOutputs(array) {
            for (var i = 0; i < array.length; ++i) {
                var info = array[i];
                var o = { name: info[0], type: info[1], link: null };
                if (array[2]) {
                    for (var j in info[2]) {
                        o[j] = info[2][j];
                    }
                }

                if (!this.outputs) {
                    this.outputs = [];
                }
                this.outputs.push(o);
                if (this.onOutputAdded) {
                    this.onOutputAdded(o);
                }

                if (LiteGraph.auto_load_slot_types) LiteGraph.registerNodeAndSlotType(this, info[1], true);

            }

            this.setSize(this.computeSize());
            this.setDirtyCanvas(true, true);
        }

        /**
             * remove an existing output slot
             * @method removeOutput
             * @param {number} slot
             */
        removeOutput(slot) {
            this.disconnectOutput(slot);
            this.outputs.splice(slot, 1);
            for (var i = slot; i < this.outputs.length; ++i) {
                if (!this.outputs[i] || !this.outputs[i].links) {
                    continue;
                }
                var links = this.outputs[i].links;
                for (var j = 0; j < links.length; ++j) {
                    var link = this.graph.links[links[j]];
                    if (!link) {
                        continue;
                    }
                    link.origin_slot -= 1;
                }
            }

            this.setSize(this.computeSize());
            if (this.onOutputRemoved) {
                this.onOutputRemoved(slot);
            }
            this.setDirtyCanvas(true, true);
        }

        /**
             * add a new input slot to use in this node
             * @method addInput
             * @param {string} name
             * @param {string} type string defining the input type ("vec3","number",...), it its a generic one use 0
             * @param {Object} extra_info this can be used to have special properties of an input (label, color, position, etc)
             */
        addInput(name, type, extra_info) {
            type = type || 0;
            var input = { name: name, type: type, link: null };
            if (extra_info) {
                for (var i in extra_info) {
                    input[i] = extra_info[i];
                }
            }

            if (!this.inputs) {
                this.inputs = [];
            }

            this.inputs.push(input);
            this.setSize(this.computeSize());

            if (this.onInputAdded) {
                this.onInputAdded(input);
            }

            LiteGraph.registerNodeAndSlotType(this, type);

            this.setDirtyCanvas(true, true);
            return input;
        }

        /**
             * add several new input slots in this node
             * @method addInputs
             * @param {Array} array of triplets like [[name,type,extra_info],[...]]
             */
        addInputs(array) {
            for (var i = 0; i < array.length; ++i) {
                var info = array[i];
                var o = { name: info[0], type: info[1], link: null };
                if (array[2]) {
                    for (var j in info[2]) {
                        o[j] = info[2][j];
                    }
                }

                if (!this.inputs) {
                    this.inputs = [];
                }
                this.inputs.push(o);
                if (this.onInputAdded) {
                    this.onInputAdded(o);
                }

                LiteGraph.registerNodeAndSlotType(this, info[1]);
            }

            this.setSize(this.computeSize());
            this.setDirtyCanvas(true, true);
        }

        /**
             * remove an existing input slot
             * @method removeInput
             * @param {number} slot
             */
        removeInput(slot) {
            this.disconnectInput(slot);
            var slot_info = this.inputs.splice(slot, 1);
            for (var i = slot; i < this.inputs.length; ++i) {
                if (!this.inputs[i]) {
                    continue;
                }
                var link = this.graph.links[this.inputs[i].link];
                if (!link) {
                    continue;
                }
                link.target_slot -= 1;
            }
            this.setSize(this.computeSize());
            if (this.onInputRemoved) {
                this.onInputRemoved(slot, slot_info[0]);
            }
            this.setDirtyCanvas(true, true);
        }

        /**
             * add an special connection to this node (used for special kinds of graphs)
             * @method addConnection
             * @param {string} name
             * @param {string} type string defining the input type ("vec3","number",...)
             * @param {[x,y]} pos position of the connection inside the node
             * @param {string} direction if is input or output
             */
        addConnection(name, type, pos, direction) {
            var o = {
                name: name,
                type: type,
                pos: pos,
                direction: direction,
                links: null
            };
            this.connections.push(o);
            return o;
        }

        /**
             * computes the minimum size of a node according to its inputs and output slots
             * @method computeSize
             * @param {vec2} minHeight
             * @return {vec2} the total size
             */
        computeSize(out) {
            if (this.constructor.size) {
                return this.constructor.size.concat();
            }

            var rows = Math.max(
                this.inputs ? this.inputs.length : 1,
                this.outputs ? this.outputs.length : 1
            );
            var size = out || new Float32Array([0, 0]);
            rows = Math.max(rows, 1);
            var font_size = LiteGraph.NODE_TEXT_SIZE; //although it should be graphcanvas.inner_text_font size

            var title_width = compute_text_size(this.title);
            var input_width = 0;
            var output_width = 0;

            if (this.inputs) {
                for (var i = 0, l = this.inputs.length; i < l; ++i) {
                    var input = this.inputs[i];
                    var text = input.label || input.name || "";
                    var text_width = compute_text_size(text);
                    if (input_width < text_width) {
                        input_width = text_width;
                    }
                }
            }

            if (this.outputs) {
                for (var i = 0, l = this.outputs.length; i < l; ++i) {
                    var output = this.outputs[i];
                    var text = output.label || output.name || "";
                    var text_width = compute_text_size(text);
                    if (output_width < text_width) {
                        output_width = text_width;
                    }
                }
            }

            size[0] = Math.max(input_width + output_width + 10, title_width);
            size[0] = Math.max(size[0], LiteGraph.NODE_WIDTH);
            if (this.widgets && this.widgets.length) {
                size[0] = Math.max(size[0], LiteGraph.NODE_WIDTH * 1.5);
            }

            size[1] = (this.constructor.slot_start_y || 0) + rows * LiteGraph.NODE_SLOT_HEIGHT;

            var widgets_height = 0;
            if (this.widgets && this.widgets.length) {
                for (var i = 0, l = this.widgets.length; i < l; ++i) {
                    if (this.widgets[i].computeSize)
                        widgets_height += this.widgets[i].computeSize(size[0])[1] + 4;

                    else
                        widgets_height += LiteGraph.NODE_WIDGET_HEIGHT + 4;
                }
                widgets_height += 8;
            }

            //compute height using widgets height
            if (this.widgets_up)
                size[1] = Math.max(size[1], widgets_height);
            else if (this.widgets_start_y != null)
                size[1] = Math.max(size[1], widgets_height + this.widgets_start_y);

            else
                size[1] += widgets_height;

            function compute_text_size(text) {
                if (!text) {
                    return 0;
                }
                return font_size * text.length * 0.6;
            }

            if (this.constructor.min_height &&
                size[1] < this.constructor.min_height) {
                size[1] = this.constructor.min_height;
            }

            size[1] += 6; //margin

            return size;
        }

        inResizeCorner(canvasX, canvasY) {
            var rows = this.outputs ? this.outputs.length : 1;
            var outputs_offset = (this.constructor.slot_start_y || 0) + rows * LiteGraph.NODE_SLOT_HEIGHT;
            return isInsideRectangle(canvasX,
                canvasY,
                this.pos[0] + this.size[0] - 15,
                this.pos[1] + Math.max(this.size[1] - 15, outputs_offset),
                20,
                20
            );
        }

        /**
             * returns all the info available about a property of this node.
             *
             * @method getPropertyInfo
             * @param {String} property name of the property
             * @return {Object} the object with all the available info
            */
        getPropertyInfo(property) {
            var info = null;

            //there are several ways to define info about a property
            //legacy mode
            if (this.properties_info) {
                for (var i = 0; i < this.properties_info.length; ++i) {
                    if (this.properties_info[i].name == property) {
                        info = this.properties_info[i];
                        break;
                    }
                }
            }
            //litescene mode using the constructor
            if (this.constructor["@" + property])
                info = this.constructor["@" + property];

            if (this.constructor.widgets_info && this.constructor.widgets_info[property])
                info = this.constructor.widgets_info[property];

            //litescene mode using the constructor
            if (!info && this.onGetPropertyInfo) {
                info = this.onGetPropertyInfo(property);
            }

            if (!info)
                info = {};
            if (!info.type)
                info.type = typeof this.properties[property];
            if (info.widget == "combo")
                info.type = "enum";

            return info;
        }

        /**
             * Defines a widget inside the node, it will be rendered on top of the node, you can control lots of properties
             *
             * @method addWidget
             * @param {String} type the widget type (could be "number","string","combo"
             * @param {String} name the text to show on the widget
             * @param {String} value the default value
             * @param {Function|String} callback function to call when it changes (optionally, it can be the name of the property to modify)
             * @param {Object} options the object that contains special properties of this widget
             * @return {Object} the created widget object
             */
        addWidget(type, name, value, callback, options) {
            if (!this.widgets) {
                this.widgets = [];
            }

            if (!options && callback && callback.constructor === Object) {
                options = callback;
                callback = null;
            }

            if (options && options.constructor === String) //options can be the property name
                options = { property: options };

            if (callback && callback.constructor === String) //callback can be the property name
            {
                if (!options)
                    options = {};
                options.property = callback;
                callback = null;
            }

            if (callback && callback.constructor !== Function) {
                console.warn("addWidget: callback must be a function");
                callback = null;
            }

            var w = {
                type: type.toLowerCase(),
                name: name,
                value: value,
                callback: callback,
                options: options || {}
            };

            if (w.options.y !== undefined) {
                w.y = w.options.y;
            }

            if (!callback && !w.options.callback && !w.options.property) {
                console.warn("LiteGraph addWidget(...) without a callback or property assigned");
            }
            if (type == "combo" && !w.options.values) {
                throw "LiteGraph addWidget('combo',...) requires to pass values in options: { values:['red','blue'] }";
            }
            this.widgets.push(w);
            this.setSize(this.computeSize());
            return w;
        }

        addCustomWidget(custom_widget) {
            if (!this.widgets) {
                this.widgets = [];
            }
            this.widgets.push(custom_widget);
            return custom_widget;
        }

        /**
             * returns the bounding of the object, used for rendering purposes
             * @method getBounding
             * @param out {Float32Array[4]?} [optional] a place to store the output, to free garbage
             * @param compute_outer {boolean?} [optional] set to true to include the shadow and connection points in the bounding calculation
             * @return {Float32Array[4]} the bounding box in format of [topleft_cornerx, topleft_cornery, width, height]
             */
        getBounding(out, compute_outer) {
            out = out || new Float32Array(4);
            const nodePos = this.pos;
            const isCollapsed = this.flags.collapsed;
            const nodeSize = this.size;

            let left_offset = 0;
            // 1 offset due to how nodes are rendered
            let right_offset = 1;
            let top_offset = 0;
            let bottom_offset = 0;

            if (compute_outer) {
                // 4 offset for collapsed node connection points
                left_offset = 4;
                // 6 offset for right shadow and collapsed node connection points
                right_offset = 6 + left_offset;
                // 4 offset for collapsed nodes top connection points
                top_offset = 4;
                // 5 offset for bottom shadow and collapsed node connection points
                bottom_offset = 5 + top_offset;
            }

            out[0] = nodePos[0] - left_offset;
            out[1] = nodePos[1] - LiteGraph.NODE_TITLE_HEIGHT - top_offset;
            out[2] = isCollapsed ?
                (this._collapsed_width || LiteGraph.NODE_COLLAPSED_WIDTH) + right_offset :
                nodeSize[0] + right_offset;
            out[3] = isCollapsed ?
                LiteGraph.NODE_TITLE_HEIGHT + bottom_offset :
                nodeSize[1] + LiteGraph.NODE_TITLE_HEIGHT + bottom_offset;

            if (this.onBounding) {
                this.onBounding(out);
            }
            return out;
        }

        /**
             * checks if a point is inside the shape of a node
             * @method isPointInside
             * @param {number} x
             * @param {number} y
             * @return {boolean}
             */
        isPointInside(x, y, margin, skip_title) {
            margin = margin || 0;

            var margin_top = this.graph && this.graph.isLive() ? 0 : LiteGraph.NODE_TITLE_HEIGHT;
            if (skip_title) {
                margin_top = 0;
            }
            if (this.flags && this.flags.collapsed) {
                //if ( distance([x,y], [this.pos[0] + this.size[0]*0.5, this.pos[1] + this.size[1]*0.5]) < LiteGraph.NODE_COLLAPSED_RADIUS)
                if (isInsideRectangle(
                    x,
                    y,
                    this.pos[0] - margin,
                    this.pos[1] - LiteGraph.NODE_TITLE_HEIGHT - margin,
                    (this._collapsed_width || LiteGraph.NODE_COLLAPSED_WIDTH) +
                    2 * margin,
                    LiteGraph.NODE_TITLE_HEIGHT + 2 * margin
                )) {
                    return true;
                }
            } else if (this.pos[0] - 4 - margin < x &&
                this.pos[0] + this.size[0] + 4 + margin > x &&
                this.pos[1] - margin_top - margin < y &&
                this.pos[1] + this.size[1] + margin > y) {
                return true;
            }
            return false;
        }

        /**
             * checks if a point is inside a node slot, and returns info about which slot
             * @method getSlotInPosition
             * @param {number} x
             * @param {number} y
             * @return {Object} if found the object contains { input|output: slot object, slot: number, link_pos: [x,y] }
             */
        getSlotInPosition(x, y) {
            //search for inputs
            var link_pos = new Float32Array(2);
            if (this.inputs) {
                for (var i = 0, l = this.inputs.length; i < l; ++i) {
                    var input = this.inputs[i];
                    this.getConnectionPos(true, i, link_pos);
                    if (isInsideRectangle(
                        x,
                        y,
                        link_pos[0] - 10,
                        link_pos[1] - 5,
                        20,
                        10
                    )) {
                        return { input: input, slot: i, link_pos: link_pos };
                    }
                }
            }

            if (this.outputs) {
                for (var i = 0, l = this.outputs.length; i < l; ++i) {
                    var output = this.outputs[i];
                    this.getConnectionPos(false, i, link_pos);
                    if (isInsideRectangle(
                        x,
                        y,
                        link_pos[0] - 10,
                        link_pos[1] - 5,
                        20,
                        10
                    )) {
                        return { output: output, slot: i, link_pos: link_pos };
                    }
                }
            }

            return null;
        }

        /**
             * returns the input slot with a given name (used for dynamic slots), -1 if not found
             * @method findInputSlot
             * @param {string} name the name of the slot
             * @param {boolean} returnObj if the obj itself wanted
             * @return {number_or_object} the slot (-1 if not found)
             */
        findInputSlot(name, returnObj) {
            if (!this.inputs) {
                return -1;
            }
            for (var i = 0, l = this.inputs.length; i < l; ++i) {
                if (name == this.inputs[i].name) {
                    return !returnObj ? i : this.inputs[i];
                }
            }
            return -1;
        }

        /**
             * returns the output slot with a given name (used for dynamic slots), -1 if not found
             * @method findOutputSlot
             * @param {string} name the name of the slot
             * @param {boolean} returnObj if the obj itself wanted
             * @return {number_or_object} the slot (-1 if not found)
             */
        findOutputSlot(name, returnObj) {
            returnObj = returnObj || false;
            if (!this.outputs) {
                return -1;
            }
            for (var i = 0, l = this.outputs.length; i < l; ++i) {
                if (name == this.outputs[i].name) {
                    return !returnObj ? i : this.outputs[i];
                }
            }
            return -1;
        }

        // TODO refactor: USE SINGLE findInput/findOutput functions! :: merge options
        /**
             * returns the first free input slot
             * @method findInputSlotFree
             * @param {object} options
             * @return {number_or_object} the slot (-1 if not found)
             */
        findInputSlotFree(optsIn) {
            var optsIn = optsIn || {};
            var optsDef = {
                returnObj: false,
                typesNotAccepted: []
            };
            var opts = Object.assign(optsDef, optsIn);
            if (!this.inputs) {
                return -1;
            }
            for (var i = 0, l = this.inputs.length; i < l; ++i) {
                if (this.inputs[i].link && this.inputs[i].link != null) {
                    continue;
                }
                if (opts.typesNotAccepted && opts.typesNotAccepted.includes && opts.typesNotAccepted.includes(this.inputs[i].type)) {
                    continue;
                }
                return !opts.returnObj ? i : this.inputs[i];
            }
            return -1;
        }

        /**
             * returns the first output slot free
             * @method findOutputSlotFree
             * @param {object} options
             * @return {number_or_object} the slot (-1 if not found)
             */
        findOutputSlotFree(optsIn) {
            var optsIn = optsIn || {};
            var optsDef = {
                returnObj: false,
                typesNotAccepted: []
            };
            var opts = Object.assign(optsDef, optsIn);
            if (!this.outputs) {
                return -1;
            }
            for (var i = 0, l = this.outputs.length; i < l; ++i) {
                if (this.outputs[i].links && this.outputs[i].links != null) {
                    continue;
                }
                if (opts.typesNotAccepted && opts.typesNotAccepted.includes && opts.typesNotAccepted.includes(this.outputs[i].type)) {
                    continue;
                }
                return !opts.returnObj ? i : this.outputs[i];
            }
            return -1;
        }

        /**
             * findSlotByType for INPUTS
             */
        findInputSlotByType(type, returnObj, preferFreeSlot, doNotUseOccupied) {
            return this.findSlotByType(true, type, returnObj, preferFreeSlot, doNotUseOccupied);
        }

        /**
             * findSlotByType for OUTPUTS
             */
        findOutputSlotByType(type, returnObj, preferFreeSlot, doNotUseOccupied) {
            return this.findSlotByType(false, type, returnObj, preferFreeSlot, doNotUseOccupied);
        }

        /**
             * returns the output (or input) slot with a given type, -1 if not found
             * @method findSlotByType
             * @param {boolean} input uise inputs instead of outputs
             * @param {string} type the type of the slot
             * @param {boolean} returnObj if the obj itself wanted
             * @param {boolean} preferFreeSlot if we want a free slot (if not found, will return the first of the type anyway)
             * @return {number_or_object} the slot (-1 if not found)
             */
        findSlotByType(input, type, returnObj, preferFreeSlot, doNotUseOccupied) {
            input = input || false;
            returnObj = returnObj || false;
            preferFreeSlot = preferFreeSlot || false;
            doNotUseOccupied = doNotUseOccupied || false;
            var aSlots = input ? this.inputs : this.outputs;
            if (!aSlots) {
                return -1;
            }
            // !! empty string type is considered 0, * !!
            if (type == "" || type == "*") type = 0;
            for (var i = 0, l = aSlots.length; i < l; ++i) {
                var tFound = false;
                var aSource = (type + "").toLowerCase().split(",");
                var aDest = aSlots[i].type == "0" || aSlots[i].type == "*" ? "0" : aSlots[i].type;
                aDest = (aDest + "").toLowerCase().split(",");
                for (var sI = 0; sI < aSource.length; sI++) {
                    for (var dI = 0; dI < aDest.length; dI++) {
                        if (aSource[sI] == "_event_") aSource[sI] = LiteGraph.EVENT;
                        if (aDest[sI] == "_event_") aDest[sI] = LiteGraph.EVENT;
                        if (aSource[sI] == "*") aSource[sI] = 0;
                        if (aDest[sI] == "*") aDest[sI] = 0;
                        if (aSource[sI] == aDest[dI]) {
                            if (preferFreeSlot && (aSlots[i].links && aSlots[i].links !== null) || (aSlots[i].link && aSlots[i].link !== null)) continue;
                            return !returnObj ? i : aSlots[i];
                        }
                    }
                }
            }
            // if didnt find some, stop checking for free slots
            if (preferFreeSlot && !doNotUseOccupied) {
                for (var i = 0, l = aSlots.length; i < l; ++i) {
                    var tFound = false;
                    var aSource = (type + "").toLowerCase().split(",");
                    var aDest = aSlots[i].type == "0" || aSlots[i].type == "*" ? "0" : aSlots[i].type;
                    aDest = (aDest + "").toLowerCase().split(",");
                    for (var sI = 0; sI < aSource.length; sI++) {
                        for (var dI = 0; dI < aDest.length; dI++) {
                            if (aSource[sI] == "*") aSource[sI] = 0;
                            if (aDest[sI] == "*") aDest[sI] = 0;
                            if (aSource[sI] == aDest[dI]) {
                                return !returnObj ? i : aSlots[i];
                            }
                        }
                    }
                }
            }
            return -1;
        }

        /**
             * connect this node output to the input of another node BY TYPE
             * @method connectByType
             * @param {number_or_string} slot (could be the number of the slot or the string with the name of the slot)
             * @param {LGraphNode} node the target node
             * @param {string} target_type the input slot type of the target node
             * @return {Object} the link_info is created, otherwise null
             */
        connectByType(slot, target_node, target_slotType, optsIn) {
            var optsIn = optsIn || {};
            var optsDef = {
                createEventInCase: true,
                firstFreeIfOutputGeneralInCase: true,
                generalTypeInCase: true
            };
            var opts = Object.assign(optsDef, optsIn);
            if (target_node && target_node.constructor === Number) {
                target_node = this.graph.getNodeById(target_node);
            }
            var target_slot = target_node.findInputSlotByType(target_slotType, false, true);
            if (target_slot >= 0 && target_slot !== null) {
                //console.debug("CONNbyTYPE type "+target_slotType+" for "+target_slot)
                return this.connect(slot, target_node, target_slot);
            } else {
                //console.log("type "+target_slotType+" not found or not free?")
                if (opts.createEventInCase && target_slotType == LiteGraph.EVENT) {
                    // WILL CREATE THE onTrigger IN SLOT
                    //console.debug("connect WILL CREATE THE onTrigger "+target_slotType+" to "+target_node);
                    return this.connect(slot, target_node, -1);
                }
                // connect to the first general output slot if not found a specific type and 
                if (opts.generalTypeInCase) {
                    var target_slot = target_node.findInputSlotByType(0, false, true, true);
                    //console.debug("connect TO a general type (*, 0), if not found the specific type ",target_slotType," to ",target_node,"RES_SLOT:",target_slot);
                    if (target_slot >= 0) {
                        return this.connect(slot, target_node, target_slot);
                    }
                }
                // connect to the first free input slot if not found a specific type and this output is general
                if (opts.firstFreeIfOutputGeneralInCase && (target_slotType == 0 || target_slotType == "*" || target_slotType == "")) {
                    var target_slot = target_node.findInputSlotFree({ typesNotAccepted: [LiteGraph.EVENT] });
                    //console.debug("connect TO TheFirstFREE ",target_slotType," to ",target_node,"RES_SLOT:",target_slot);
                    if (target_slot >= 0) {
                        return this.connect(slot, target_node, target_slot);
                    }
                }

                console.debug("no way to connect type: ", target_slotType, " to targetNODE ", target_node);
                //TODO filter
                return null;
            }
        }

        /**
             * connect this node input to the output of another node BY TYPE
             * @method connectByType
             * @param {number_or_string} slot (could be the number of the slot or the string with the name of the slot)
             * @param {LGraphNode} node the target node
             * @param {string} target_type the output slot type of the target node
             * @return {Object} the link_info is created, otherwise null
             */
        connectByTypeOutput(slot, source_node, source_slotType, optsIn) {
            var optsIn = optsIn || {};
            var optsDef = {
                createEventInCase: true,
                firstFreeIfInputGeneralInCase: true,
                generalTypeInCase: true
            };
            var opts = Object.assign(optsDef, optsIn);
            if (source_node && source_node.constructor === Number) {
                source_node = this.graph.getNodeById(source_node);
            }
            var source_slot = source_node.findOutputSlotByType(source_slotType, false, true);
            if (source_slot >= 0 && source_slot !== null) {
                //console.debug("CONNbyTYPE OUT! type "+source_slotType+" for "+source_slot)
                return source_node.connect(source_slot, this, slot);
            } else {

                // connect to the first general output slot if not found a specific type and 
                if (opts.generalTypeInCase) {
                    var source_slot = source_node.findOutputSlotByType(0, false, true, true);
                    if (source_slot >= 0) {
                        return source_node.connect(source_slot, this, slot);
                    }
                }

                if (opts.createEventInCase && source_slotType == LiteGraph.EVENT) {
                    // WILL CREATE THE onExecuted OUT SLOT
                    if (LiteGraph.do_add_triggers_slots) {
                        var source_slot = source_node.addOnExecutedOutput();
                        return source_node.connect(source_slot, this, slot);
                    }
                }
                // connect to the first free output slot if not found a specific type and this input is general
                if (opts.firstFreeIfInputGeneralInCase && (source_slotType == 0 || source_slotType == "*" || source_slotType == "")) {
                    var source_slot = source_node.findOutputSlotFree({ typesNotAccepted: [LiteGraph.EVENT] });
                    if (source_slot >= 0) {
                        return source_node.connect(source_slot, this, slot);
                    }
                }

                console.debug("no way to connect byOUT type: ", source_slotType, " to sourceNODE ", source_node);
                //TODO filter
                //console.log("type OUT! "+source_slotType+" not found or not free?")
                return null;
            }
        }

        /**
             * connect this node output to the input of another node
             * @method connect
             * @param {number_or_string} slot (could be the number of the slot or the string with the name of the slot)
             * @param {LGraphNode} node the target node
             * @param {number_or_string} target_slot the input slot of the target node (could be the number of the slot or the string with the name of the slot, or -1 to connect a trigger)
             * @return {Object} the link_info is created, otherwise null
             */
        connect(slot, target_node, target_slot) {
            target_slot = target_slot || 0;

            if (!this.graph) {
                //could be connected before adding it to a graph
                console.log(
                    "Connect: Error, node doesn't belong to any graph. Nodes must be added first to a graph before connecting them."
                ); //due to link ids being associated with graphs
                return null;
            }

            //seek for the output slot
            if (slot.constructor === String) {
                slot = this.findOutputSlot(slot);
                if (slot == -1) {
                    if (LiteGraph.debug) {
                        console.log("Connect: Error, no slot of name " + slot);
                    }
                    return null;
                }
            } else if (!this.outputs || slot >= this.outputs.length) {
                if (LiteGraph.debug) {
                    console.log("Connect: Error, slot number not found");
                }
                return null;
            }

            if (target_node && target_node.constructor === Number) {
                target_node = this.graph.getNodeById(target_node);
            }
            if (!target_node) {
                throw "target node is null";
            }

            //avoid loopback
            if (target_node == this) {
                return null;
            }

            //you can specify the slot by name
            if (target_slot.constructor === String) {
                target_slot = target_node.findInputSlot(target_slot);
                if (target_slot == -1) {
                    if (LiteGraph.debug) {
                        console.log(
                            "Connect: Error, no slot of name " + target_slot
                        );
                    }
                    return null;
                }
            } else if (target_slot === LiteGraph.EVENT) {

                if (LiteGraph.do_add_triggers_slots) {
                    //search for first slot with event? :: NO this is done outside
                    //console.log("Connect: Creating triggerEvent");
                    // force mode
                    target_node.changeMode(LiteGraph.ON_TRIGGER);
                    target_slot = target_node.findInputSlot("onTrigger");
                } else {
                    return null; // -- break --
                }
            } else if (!target_node.inputs ||
                target_slot >= target_node.inputs.length) {
                if (LiteGraph.debug) {
                    console.log("Connect: Error, slot number not found");
                }
                return null;
            }

            var changed = false;

            var input = target_node.inputs[target_slot];
            var link_info = null;
            var output = this.outputs[slot];

            if (!this.outputs[slot]) {
                /*console.debug("Invalid slot passed: "+slot);
                console.debug(this.outputs);*/
                return null;
            }

            // allow target node to change slot
            if (target_node.onBeforeConnectInput) {
                // This way node can choose another slot (or make a new one?)
                target_slot = target_node.onBeforeConnectInput(target_slot); //callback
            }

            //check target_slot and check connection types
            if (target_slot === false || target_slot === null || !LiteGraph.isValidConnection(output.type, input.type)) {
                this.setDirtyCanvas(false, true);
                if (changed)
                    this.graph.connectionChange(this, link_info);
                return null;
            } else {
                //console.debug("valid connection",output.type, input.type);
            }

            //allows nodes to block connection, callback
            if (target_node.onConnectInput) {
                if (target_node.onConnectInput(target_slot, output.type, output, this, slot) === false) {
                    return null;
                }
            }
            if (this.onConnectOutput) { // callback
                if (this.onConnectOutput(slot, input.type, input, target_node, target_slot) === false) {
                    return null;
                }
            }

            //if there is something already plugged there, disconnect
            if (target_node.inputs[target_slot] && target_node.inputs[target_slot].link != null) {
                this.graph.beforeChange();
                target_node.disconnectInput(target_slot, { doProcessChange: false });
                changed = true;
            }
            if (output.links !== null && output.links.length) {
                switch (output.type) {
                    case LiteGraph.EVENT:
                        if (!LiteGraph.allow_multi_output_for_events) {
                            this.graph.beforeChange();
                            this.disconnectOutput(slot, false, { doProcessChange: false }); // Input(target_slot, {doProcessChange: false});
                            changed = true;
                        }
                        break;
                    default:
                        break;
                }
            }

            var nextId;
            if (LiteGraph.use_uuids)
                nextId = LiteGraph.uuidv4();

            else
                nextId = ++this.graph.last_link_id;

            //create link class
            link_info = new LLink(
                nextId,
                input.type || output.type,
                this.id,
                slot,
                target_node.id,
                target_slot
            );

            //add to graph links list
            this.graph.links[link_info.id] = link_info;

            //connect in output
            if (output.links == null) {
                output.links = [];
            }
            output.links.push(link_info.id);
            //connect in input
            target_node.inputs[target_slot].link = link_info.id;
            if (this.graph) {
                this.graph._version++;
            }
            if (this.onConnectionsChange) {
                this.onConnectionsChange(
                    LiteGraph.OUTPUT,
                    slot,
                    true,
                    link_info,
                    output
                );
            } //link_info has been created now, so its updated
            if (target_node.onConnectionsChange) {
                target_node.onConnectionsChange(
                    LiteGraph.INPUT,
                    target_slot,
                    true,
                    link_info,
                    input
                );
            }
            if (this.graph && this.graph.onNodeConnectionChange) {
                this.graph.onNodeConnectionChange(
                    LiteGraph.INPUT,
                    target_node,
                    target_slot,
                    this,
                    slot
                );
                this.graph.onNodeConnectionChange(
                    LiteGraph.OUTPUT,
                    this,
                    slot,
                    target_node,
                    target_slot
                );
            }

            this.setDirtyCanvas(false, true);
            this.graph.afterChange();
            this.graph.connectionChange(this, link_info);

            return link_info;
        }

        /**
             * disconnect one output to an specific node
             * @method disconnectOutput
             * @param {number_or_string} slot (could be the number of the slot or the string with the name of the slot)
             * @param {LGraphNode} target_node the target node to which this slot is connected [Optional, if not target_node is specified all nodes will be disconnected]
             * @return {boolean} if it was disconnected successfully
             */
        disconnectOutput(slot, target_node) {
            if (slot.constructor === String) {
                slot = this.findOutputSlot(slot);
                if (slot == -1) {
                    if (LiteGraph.debug) {
                        console.log("Connect: Error, no slot of name " + slot);
                    }
                    return false;
                }
            } else if (!this.outputs || slot >= this.outputs.length) {
                if (LiteGraph.debug) {
                    console.log("Connect: Error, slot number not found");
                }
                return false;
            }

            //get output slot
            var output = this.outputs[slot];
            if (!output || !output.links || output.links.length == 0) {
                return false;
            }

            //one of the output links in this slot
            if (target_node) {
                if (target_node.constructor === Number) {
                    target_node = this.graph.getNodeById(target_node);
                }
                if (!target_node) {
                    throw "Target Node not found";
                }

                for (var i = 0, l = output.links.length; i < l; i++) {
                    var link_id = output.links[i];
                    var link_info = this.graph.links[link_id];

                    //is the link we are searching for...
                    if (link_info.target_id == target_node.id) {
                        output.links.splice(i, 1); //remove here
                        var input = target_node.inputs[link_info.target_slot];
                        input.link = null; //remove there
                        delete this.graph.links[link_id]; //remove the link from the links pool
                        if (this.graph) {
                            this.graph._version++;
                        }
                        if (target_node.onConnectionsChange) {
                            target_node.onConnectionsChange(
                                LiteGraph.INPUT,
                                link_info.target_slot,
                                false,
                                link_info,
                                input
                            );
                        } //link_info hasn't been modified so its ok
                        if (this.onConnectionsChange) {
                            this.onConnectionsChange(
                                LiteGraph.OUTPUT,
                                slot,
                                false,
                                link_info,
                                output
                            );
                        }
                        if (this.graph && this.graph.onNodeConnectionChange) {
                            this.graph.onNodeConnectionChange(
                                LiteGraph.OUTPUT,
                                this,
                                slot
                            );
                        }
                        if (this.graph && this.graph.onNodeConnectionChange) {
                            this.graph.onNodeConnectionChange(
                                LiteGraph.OUTPUT,
                                this,
                                slot
                            );
                            this.graph.onNodeConnectionChange(
                                LiteGraph.INPUT,
                                target_node,
                                link_info.target_slot
                            );
                        }
                        break;
                    }
                }
            } //all the links in this output slot
            else {
                for (var i = 0, l = output.links.length; i < l; i++) {
                    var link_id = output.links[i];
                    var link_info = this.graph.links[link_id];
                    if (!link_info) {
                        //bug: it happens sometimes
                        continue;
                    }

                    var target_node = this.graph.getNodeById(link_info.target_id);
                    var input = null;
                    if (this.graph) {
                        this.graph._version++;
                    }
                    if (target_node) {
                        input = target_node.inputs[link_info.target_slot];
                        input.link = null; //remove other side link
                        if (target_node.onConnectionsChange) {
                            target_node.onConnectionsChange(
                                LiteGraph.INPUT,
                                link_info.target_slot,
                                false,
                                link_info,
                                input
                            );
                        } //link_info hasn't been modified so its ok
                        if (this.graph && this.graph.onNodeConnectionChange) {
                            this.graph.onNodeConnectionChange(
                                LiteGraph.INPUT,
                                target_node,
                                link_info.target_slot
                            );
                        }
                    }
                    delete this.graph.links[link_id]; //remove the link from the links pool
                    if (this.onConnectionsChange) {
                        this.onConnectionsChange(
                            LiteGraph.OUTPUT,
                            slot,
                            false,
                            link_info,
                            output
                        );
                    }
                    if (this.graph && this.graph.onNodeConnectionChange) {
                        this.graph.onNodeConnectionChange(
                            LiteGraph.OUTPUT,
                            this,
                            slot
                        );
                        this.graph.onNodeConnectionChange(
                            LiteGraph.INPUT,
                            target_node,
                            link_info.target_slot
                        );
                    }
                }
                output.links = null;
            }

            this.setDirtyCanvas(false, true);
            this.graph.connectionChange(this);
            return true;
        }

        /**
             * disconnect one input
             * @method disconnectInput
             * @param {number_or_string} slot (could be the number of the slot or the string with the name of the slot)
             * @return {boolean} if it was disconnected successfully
             */
        disconnectInput(slot) {
            //seek for the output slot
            if (slot.constructor === String) {
                slot = this.findInputSlot(slot);
                if (slot == -1) {
                    if (LiteGraph.debug) {
                        console.log("Connect: Error, no slot of name " + slot);
                    }
                    return false;
                }
            } else if (!this.inputs || slot >= this.inputs.length) {
                if (LiteGraph.debug) {
                    console.log("Connect: Error, slot number not found");
                }
                return false;
            }

            var input = this.inputs[slot];
            if (!input) {
                return false;
            }

            var link_id = this.inputs[slot].link;
            if (link_id != null) {
                this.inputs[slot].link = null;

                //remove other side
                var link_info = this.graph.links[link_id];
                if (link_info) {
                    var target_node = this.graph.getNodeById(link_info.origin_id);
                    if (!target_node) {
                        return false;
                    }

                    var output = target_node.outputs[link_info.origin_slot];
                    if (!output || !output.links || output.links.length == 0) {
                        return false;
                    }

                    //search in the inputs list for this link
                    for (var i = 0, l = output.links.length; i < l; i++) {
                        if (output.links[i] == link_id) {
                            output.links.splice(i, 1);
                            break;
                        }
                    }

                    delete this.graph.links[link_id]; //remove from the pool
                    if (this.graph) {
                        this.graph._version++;
                    }
                    if (this.onConnectionsChange) {
                        this.onConnectionsChange(
                            LiteGraph.INPUT,
                            slot,
                            false,
                            link_info,
                            input
                        );
                    }
                    if (target_node.onConnectionsChange) {
                        target_node.onConnectionsChange(
                            LiteGraph.OUTPUT,
                            i,
                            false,
                            link_info,
                            output
                        );
                    }
                    if (this.graph && this.graph.onNodeConnectionChange) {
                        this.graph.onNodeConnectionChange(
                            LiteGraph.OUTPUT,
                            target_node,
                            i
                        );
                        this.graph.onNodeConnectionChange(LiteGraph.INPUT, this, slot);
                    }
                }
            } //link != null

            this.setDirtyCanvas(false, true);
            if (this.graph)
                this.graph.connectionChange(this);
            return true;
        }

        /**
             * returns the center of a connection point in canvas coords
             * @method getConnectionPos
             * @param {boolean} is_input true if if a input slot, false if it is an output
             * @param {number_or_string} slot (could be the number of the slot or the string with the name of the slot)
             * @param {vec2} out [optional] a place to store the output, to free garbage
             * @return {[x,y]} the position
             **/
        getConnectionPos(is_input,
            slot_number,
            out) {
            out = out || new Float32Array(2);
            var num_slots = 0;
            if (is_input && this.inputs) {
                num_slots = this.inputs.length;
            }
            if (!is_input && this.outputs) {
                num_slots = this.outputs.length;
            }

            var offset = LiteGraph.NODE_SLOT_HEIGHT * 0.5;

            if (this.flags.collapsed) {
                var w = this._collapsed_width || LiteGraph.NODE_COLLAPSED_WIDTH;
                if (this.horizontal) {
                    out[0] = this.pos[0] + w * 0.5;
                    if (is_input) {
                        out[1] = this.pos[1] - LiteGraph.NODE_TITLE_HEIGHT;
                    } else {
                        out[1] = this.pos[1];
                    }
                } else {
                    if (is_input) {
                        out[0] = this.pos[0];
                    } else {
                        out[0] = this.pos[0] + w;
                    }
                    out[1] = this.pos[1] - LiteGraph.NODE_TITLE_HEIGHT * 0.5;
                }
                return out;
            }

            //weird feature that never got finished
            if (is_input && slot_number == -1) {
                out[0] = this.pos[0] + LiteGraph.NODE_TITLE_HEIGHT * 0.5;
                out[1] = this.pos[1] + LiteGraph.NODE_TITLE_HEIGHT * 0.5;
                return out;
            }

            //hard-coded pos
            if (is_input &&
                num_slots > slot_number &&
                this.inputs[slot_number].pos) {
                out[0] = this.pos[0] + this.inputs[slot_number].pos[0];
                out[1] = this.pos[1] + this.inputs[slot_number].pos[1];
                return out;
            } else if (!is_input &&
                num_slots > slot_number &&
                this.outputs[slot_number].pos) {
                out[0] = this.pos[0] + this.outputs[slot_number].pos[0];
                out[1] = this.pos[1] + this.outputs[slot_number].pos[1];
                return out;
            }

            //horizontal distributed slots
            if (this.horizontal) {
                out[0] =
                    this.pos[0] + (slot_number + 0.5) * (this.size[0] / num_slots);
                if (is_input) {
                    out[1] = this.pos[1] - LiteGraph.NODE_TITLE_HEIGHT;
                } else {
                    out[1] = this.pos[1] + this.size[1];
                }
                return out;
            }

            //default vertical slots
            if (is_input) {
                out[0] = this.pos[0] + offset;
            } else {
                out[0] = this.pos[0] + this.size[0] + 1 - offset;
            }
            out[1] =
                this.pos[1] +
                (slot_number + 0.7) * LiteGraph.NODE_SLOT_HEIGHT +
                (this.constructor.slot_start_y || 0);
            return out;
        }

        /* Force align to grid */
        alignToGrid() {
            this.pos[0] =
                LiteGraph.CANVAS_GRID_SIZE *
                Math.round(this.pos[0] / LiteGraph.CANVAS_GRID_SIZE);
            this.pos[1] =
                LiteGraph.CANVAS_GRID_SIZE *
                Math.round(this.pos[1] / LiteGraph.CANVAS_GRID_SIZE);
        }

        /* Console output */
        trace(msg) {
            if (!this.console) {
                this.console = [];
            }

            this.console.push(msg);
            if (this.console.length > LGraphNode.MAX_CONSOLE) {
                this.console.shift();
            }

            if (this.graph.onNodeTrace)
                this.graph.onNodeTrace(this, msg);
        }

        /* Forces to redraw or the main canvas (LGraphNode) or the bg canvas (links) */
        setDirtyCanvas(dirty_foreground,
            dirty_background) {
            if (!this.graph) {
                return;
            }
            this.graph.sendActionToCanvas("setDirty", [
                dirty_foreground,
                dirty_background
            ]);
        }

        loadImage(url) {
            var img = new Image();
            img.src = LiteGraph.node_images_path + url;
            img.ready = false;

            var that = this;
            img.onload = function () {
                this.ready = true;
                that.setDirtyCanvas(true);
            };
            return img;
        }

        //safe LGraphNode action execution (not sure if safe)
        /*
        LGraphNode.prototype.executeAction = function(action)
        {
            if(action == "") return false;
        
            if( action.indexOf(";") != -1 || action.indexOf("}") != -1)
            {
                this.trace("Error: Action contains unsafe characters");
                return false;
            }
        
            var tokens = action.split("(");
            var func_name = tokens[0];
            if( typeof(this[func_name]) != "function")
            {
                this.trace("Error: Action not found on node: " + func_name);
                return false;
            }
        
            var code = action;
        
            try
            {
                var _foo = eval;
                eval = null;
                (new Function("with(this) { " + code + "}")).call(this);
                eval = _foo;
            }
            catch (err)
            {
                this.trace("Error executing action {" + action + "} :" + err);
                return false;
            }
        
            return true;
        }
        */
        /* Allows to get onMouseMove and onMouseUp events even if the mouse is out of focus */
        captureInput(v) {
            if (!this.graph || !this.graph.list_of_graphcanvas) {
                return;
            }

            var list = this.graph.list_of_graphcanvas;

            for (var i = 0; i < list.length; ++i) {
                var c = list[i];
                //releasing somebody elses capture?!
                if (!v && c.node_capturing_input != this) {
                    continue;
                }

                //change
                c.node_capturing_input = v ? this : null;
            }
        }

        get collapsed() {
            return !!this.flags.collapsed;
        }

        get collapsible() {
            return !this.pinned && (this.constructor.collapsable !== false);
        }

        /**
             * Collapse the node to make it smaller on the canvas
             * @method collapse
             **/
        collapse(force) {
            this.graph._version++;
            if (!this.collapsible && !force) {
                return;
            }
            if (!this.flags.collapsed) {
                this.flags.collapsed = true;
            } else {
                this.flags.collapsed = false;
            }
            this.setDirtyCanvas(true, true);
        }

        get pinned() {
            return !!this.flags.pinned;
        }

        /**
             * Forces the node to do not move or realign on Z or resize
             * @method pin
             **/
        pin(v) {
            this.graph._version++;
            if (v === undefined) {
                this.flags.pinned = !this.flags.pinned;
            } else {
                this.flags.pinned = v;
            }
            this.resizable = !this.pinned;
            // Delete the flag if unpinned, so that we don't get unnecessary
            // flags.pinned = false in serialized object.
            if (!this.pinned) {
                delete this.flags.pinned;
            }
        }

        localToScreen(x, y, graphcanvas) {
            return [
                (x + this.pos[0]) * graphcanvas.scale + graphcanvas.offset[0],
                (y + this.pos[1]) * graphcanvas.scale + graphcanvas.offset[1]
            ];
        }

        get width() {
            return this.collapsed ? this._collapsed_width || LiteGraph.NODE_COLLAPSED_WIDTH : this.size[0];
        }

        get height() {
            return this.collapsed ? LiteGraph.NODE_COLLAPSED_HEIGHT : this.size[1];
        }

        drawBadges(ctx, {gap = 2} = {}) {
            const badgeInstances = this.badges.map(badge => badge instanceof LGraphBadge ? badge : badge());
            const isLeftAligned = this.badgePosition === BadgePosition.TopLeft;

            let currentX = isLeftAligned ? 0 : this.width - badgeInstances.reduce((acc, badge) => acc + badge.getWidth(ctx) + gap, 0);
            const y = - (LiteGraph.NODE_TITLE_HEIGHT + gap);

            for (const badge of badgeInstances) {
                badge.draw(ctx, currentX, y - badge.height);
                currentX += badge.getWidth(ctx) + gap;
            }
        }
    }

    globalThis.LGraphNode = LiteGraph.LGraphNode = LGraphNode;

    class LGraphGroup {

        constructor(title) {
            this._ctor(title);
        }

        _ctor(title) {
            this.title = title || "Group";
            this.font_size = LiteGraph.DEFAULT_GROUP_FONT || 24;
            this.color = LGraphCanvas.node_colors.pale_blue
                ? LGraphCanvas.node_colors.pale_blue.groupcolor
                : "#AAA";
            this._bounding = new Float32Array([10, 10, 140, 80]);
            this._pos = this._bounding.subarray(0, 2);
            this._size = this._bounding.subarray(2, 4);
            this._nodes = [];
            this.graph = null;
            this.flags = {};

            Object.defineProperty(this, "pos", {
                set: function (v) {
                    if (!v || v.length < 2) {
                        return;
                    }
                    this._pos[0] = v[0];
                    this._pos[1] = v[1];
                },
                get: function () {
                    return this._pos;
                },
                enumerable: true
            });

            Object.defineProperty(this, "size", {
                set: function (v) {
                    if (!v || v.length < 2) {
                        return;
                    }
                    this._size[0] = Math.max(140, v[0]);
                    this._size[1] = Math.max(80, v[1]);
                },
                get: function () {
                    return this._size;
                },
                enumerable: true
            });
        }

        get nodes() {
            return this._nodes;
        }

        get titleHeight() {
            return this.font_size * 1.4;
        }

        get selected() {
            return !!this.graph?.list_of_graphcanvas?.some(c => c.selected_group === this);
        }

        get pinned() {
            return !!this.flags.pinned;
        }

        pin() {
            this.flags.pinned = true;
        }

        unpin() {
            delete this.flags.pinned;
        }

        configure(o) {
            this.title = o.title;
            this._bounding.set(o.bounding);
            this.color = o.color;
            this.flags = o.flags || this.flags;
            if (o.font_size) {
                this.font_size = o.font_size;
            }
        }

        serialize() {
            var b = this._bounding;
            return {
                title: this.title,
                bounding: [
                    Math.round(b[0]),
                    Math.round(b[1]),
                    Math.round(b[2]),
                    Math.round(b[3])
                ],
                color: this.color,
                font_size: this.font_size,
                flags: this.flags,
            };
        }

        /**
         * Draws the group on the canvas
         * @param {LGraphCanvas} graphCanvas
         * @param {CanvasRenderingContext2D} ctx
         */
        draw(graphCanvas, ctx) {
            const padding = 4;

            ctx.fillStyle = this.color;
            ctx.strokeStyle = this.color;
            const [x, y] = this._pos;
            const [width, height] = this._size;
            ctx.globalAlpha = 0.25 * graphCanvas.editor_alpha;
            ctx.beginPath();
            ctx.rect(x + 0.5, y + 0.5, width, height);
            ctx.fill();
            ctx.globalAlpha = graphCanvas.editor_alpha;
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(x + width, y + height);
            ctx.lineTo(x + width - 10, y + height);
            ctx.lineTo(x + width, y + height - 10);
            ctx.fill();

            const font_size = this.font_size || LiteGraph.DEFAULT_GROUP_FONT_SIZE;
            ctx.font = font_size + "px Arial";
            ctx.textAlign = "left";
            ctx.fillText(this.title + (this.pinned ? "📌" : ""), x + padding, y + font_size);

            if (LiteGraph.highlight_selected_group && this.selected) {
                graphCanvas.drawSelectionBounding(ctx, this._bounding, {
                    shape: LiteGraph.BOX_SHAPE,
                    title_height: this.titleHeight,
                    title_mode: LiteGraph.NORMAL_TITLE,
                    fgcolor: this.color,
                    padding,
                });
            }
        }

        resize(width, height) {
            if (this.pinned) {
                return;
            }
            this._size[0] = width;
            this._size[1] = height;
        }

        move(deltax, deltay, ignore_nodes) {
            if (this.pinned) {
                return;
            }
            this._pos[0] += deltax;
            this._pos[1] += deltay;
            if (ignore_nodes) {
                return;
            }
            for (var i = 0; i < this._nodes.length; ++i) {
                var node = this._nodes[i];
                node.pos[0] += deltax;
                node.pos[1] += deltay;
            }
        }

        recomputeInsideNodes() {
            this._nodes.length = 0;
            var nodes = this.graph._nodes;
            var node_bounding = new Float32Array(4);

            for (var i = 0; i < nodes.length; ++i) {
                var node = nodes[i];
                node.getBounding(node_bounding);
                if (!overlapBounding(this._bounding, node_bounding)) {
                    continue;
                } //out of the visible area
                this._nodes.push(node);
            }
        }

        /**
         * Add nodes to the group and adjust the group's position and size accordingly
         * @param {LGraphNode[]} nodes - The nodes to add to the group
         * @param {number} [padding=10] - The padding around the group
         * @returns {void}
         */
        addNodes(nodes, padding = 10) {
            if (!this._nodes && nodes.length === 0) return;

            const allNodes = [...(this._nodes || []), ...nodes];

            const bounds = allNodes.reduce((acc, node) => {
                const [x, y] = node.pos;
                const [width, height] = node.size;
                const isReroute = node.type === "Reroute";
                const isCollapsed = node.flags?.collapsed;

                const top = y - (isReroute ? 0 : LiteGraph.NODE_TITLE_HEIGHT);
                const bottom = isCollapsed ? top + LiteGraph.NODE_TITLE_HEIGHT : y + height;
                const right = isCollapsed && node._collapsed_width ? x + Math.round(node._collapsed_width) : x + width;

                return {
                left: Math.min(acc.left, x),
                top: Math.min(acc.top, top),
                right: Math.max(acc.right, right),
                bottom: Math.max(acc.bottom, bottom)
                };
            }, { left: Infinity, top: Infinity, right: -Infinity, bottom: -Infinity });

            this.pos = [
                bounds.left - padding,
                bounds.top - padding - this.titleHeight
            ];

            this.size = [
                bounds.right - bounds.left + padding * 2,
                bounds.bottom - bounds.top + padding * 2 + this.titleHeight
            ];
        }

        getMenuOptions() {
            return [
                {
                    content: this.pinned ? "Unpin" : "Pin",
                    callback: () => {
                        this.pinned ? this.unpin() : this.pin();
                        this.setDirtyCanvas(false, true);
                    },
                },
				null,
                { content: "Title", callback: LGraphCanvas.onShowPropertyEditor },
                {
                    content: "Color",
                    has_submenu: true,
                    callback: LGraphCanvas.onMenuNodeColors
                },
                {
                    content: "Font size",
                    property: "font_size",
                    type: "Number",
                    callback: LGraphCanvas.onShowPropertyEditor
                },
                null,
                { content: "Remove", callback: LGraphCanvas.onMenuNodeRemove }
            ];
        }
    }

    LGraphGroup.prototype.isPointInside = LGraphNode.prototype.isPointInside;
    LGraphGroup.prototype.setDirtyCanvas = LGraphNode.prototype.setDirtyCanvas;

    globalThis.LGraphGroup = LiteGraph.LGraphGroup = LGraphGroup;

    //****************************************

    //Scale and Offset
    class DragAndScale {
        constructor(element, skip_events) {
            this.offset = new Float32Array([0, 0]);
            this.scale = 1;
            this.max_scale = 10;
            this.min_scale = 0.1;
            this.onredraw = null;
            this.enabled = true;
            this.last_mouse = [0, 0];
            this.element = null;
            this.visible_area = new Float32Array(4);

            if (element) {
                this.element = element;
                if (!skip_events) {
                    this.bindEvents(element);
                }
            }
        }

        bindEvents(element) {
            this.last_mouse = new Float32Array(2);

            this._binded_mouse_callback = this.onMouse.bind(this);

            LiteGraph.pointerListenerAdd(element, "down", this._binded_mouse_callback);
            LiteGraph.pointerListenerAdd(element, "move", this._binded_mouse_callback);
            LiteGraph.pointerListenerAdd(element, "up", this._binded_mouse_callback);

            element.addEventListener(
                "mousewheel",
                this._binded_mouse_callback,
                false
            );
            element.addEventListener("wheel", this._binded_mouse_callback, false);
        }

        computeVisibleArea(viewport) {
            if (!this.element) {
                this.visible_area[0] = this.visible_area[1] = this.visible_area[2] = this.visible_area[3] = 0;
                return;
            }
            var width = this.element.width;
            var height = this.element.height;
            var startx = -this.offset[0];
            var starty = -this.offset[1];
            if (viewport) {
                startx += viewport[0] / this.scale;
                starty += viewport[1] / this.scale;
                width = viewport[2];
                height = viewport[3];
            }
            var endx = startx + width / this.scale;
            var endy = starty + height / this.scale;
            this.visible_area[0] = startx;
            this.visible_area[1] = starty;
            this.visible_area[2] = endx - startx;
            this.visible_area[3] = endy - starty;
        }

        onMouse(e) {
            if (!this.enabled) {
                return;
            }

            var canvas = this.element;
            var rect = canvas.getBoundingClientRect();
            var x = e.clientX - rect.left;
            var y = e.clientY - rect.top;
            e.canvasx = x;
            e.canvasy = y;
            e.dragging = this.dragging;

            var is_inside = !this.viewport || (this.viewport && x >= this.viewport[0] && x < (this.viewport[0] + this.viewport[2]) && y >= this.viewport[1] && y < (this.viewport[1] + this.viewport[3]));

            //console.log("pointerevents: DragAndScale onMouse "+e.type+" "+is_inside);
            var ignore = false;
            if (this.onmouse) {
                ignore = this.onmouse(e);
            }

            if (e.type == LiteGraph.pointerevents_method + "down" && is_inside) {
                this.dragging = true;
                LiteGraph.pointerListenerRemove(canvas, "move", this._binded_mouse_callback);
                LiteGraph.pointerListenerAdd(document, "move", this._binded_mouse_callback);
                LiteGraph.pointerListenerAdd(document, "up", this._binded_mouse_callback);
            } else if (e.type == LiteGraph.pointerevents_method + "move") {
                if (!ignore) {
                    var deltax = x - this.last_mouse[0];
                    var deltay = y - this.last_mouse[1];
                    if (this.dragging) {
                        this.mouseDrag(deltax, deltay);
                    }
                }
            } else if (e.type == LiteGraph.pointerevents_method + "up") {
                this.dragging = false;
                LiteGraph.pointerListenerRemove(document, "move", this._binded_mouse_callback);
                LiteGraph.pointerListenerRemove(document, "up", this._binded_mouse_callback);
                LiteGraph.pointerListenerAdd(canvas, "move", this._binded_mouse_callback);
            } else if (is_inside &&
                (e.type == "mousewheel" ||
                    e.type == "wheel" ||
                    e.type == "DOMMouseScroll")) {
                e.eventType = "mousewheel";
                if (e.type == "wheel") {
                    e.wheel = -e.deltaY;
                } else {
                    e.wheel =
                        e.wheelDeltaY != null ? e.wheelDeltaY : e.detail * -60;
                }

                //from stack overflow
                e.delta = e.wheelDelta
                    ? e.wheelDelta / 40
                    : e.deltaY
                        ? -e.deltaY / 3
                        : 0;
                this.changeDeltaScale(1.0 + e.delta * 0.05);
            }

            this.last_mouse[0] = x;
            this.last_mouse[1] = y;

            if (is_inside) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
        }

        toCanvasContext(ctx) {
            ctx.scale(this.scale, this.scale);
            ctx.translate(this.offset[0], this.offset[1]);
        }

        convertOffsetToCanvas(pos) {
            //return [pos[0] / this.scale - this.offset[0], pos[1] / this.scale - this.offset[1]];
            return [
                (pos[0] + this.offset[0]) * this.scale,
                (pos[1] + this.offset[1]) * this.scale
            ];
        }

        convertCanvasToOffset(pos, out) {
            out = out || [0, 0];
            out[0] = pos[0] / this.scale - this.offset[0];
            out[1] = pos[1] / this.scale - this.offset[1];
            return out;
        }

        mouseDrag(x, y) {
            this.offset[0] += x / this.scale;
            this.offset[1] += y / this.scale;

            if (this.onredraw) {
                this.onredraw(this);
            }
        }

        changeScale(value, zooming_center) {
            if (value < this.min_scale) {
                value = this.min_scale;
            } else if (value > this.max_scale) {
                value = this.max_scale;
            }

            if (value == this.scale) {
                return;
            }

            if (!this.element) {
                return;
            }

            var rect = this.element.getBoundingClientRect();
            if (!rect) {
                return;
            }

            zooming_center = zooming_center || [
                rect.width * 0.5,
                rect.height * 0.5
            ];
            var center = this.convertCanvasToOffset(zooming_center);
            this.scale = value;
            if (Math.abs(this.scale - 1) < 0.01) {
                this.scale = 1;
            }

            var new_center = this.convertCanvasToOffset(zooming_center);
            var delta_offset = [
                new_center[0] - center[0],
                new_center[1] - center[1]
            ];

            this.offset[0] += delta_offset[0];
            this.offset[1] += delta_offset[1];

            if (this.onredraw) {
                this.onredraw(this);
            }
        }

        changeDeltaScale(value, zooming_center) {
            this.changeScale(this.scale * value, zooming_center);
        }

        reset() {
            this.scale = 1;
            this.offset[0] = 0;
            this.offset[1] = 0;
        }
    }

    LiteGraph.DragAndScale = DragAndScale;

    //*********************************************************************************
    // LGraphCanvas: LGraph renderer CLASS
    //*********************************************************************************

    /**
     * This class is in charge of rendering one graph inside a canvas. And provides all the interaction required.
     * Valid callbacks are: onNodeSelected, onNodeDeselected, onShowNodePanel, onNodeDblClicked
     *
     * @class LGraphCanvas
     * @constructor
     * @param {HTMLCanvas} canvas the canvas where you want to render (it accepts a selector in string format or the canvas element itself)
     * @param {LGraph} graph [optional]
     * @param {Object} options [optional] { skip_rendering, autoresize, viewport }
     */
    class LGraphCanvas {

        /* Interaction */
        static #temp = new Float32Array(4);
        static #temp_vec2 = new Float32Array(2);
        static #tmp_area = new Float32Array(4);
        static #margin_area = new Float32Array(4);
        static #link_bounding = new Float32Array(4);
        static #tempA = new Float32Array(2);
        static #tempB = new Float32Array(2);

        static DEFAULT_BACKGROUND_IMAGE = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAIAAAD/gAIDAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAQBJREFUeNrs1rEKwjAUhlETUkj3vP9rdmr1Ysammk2w5wdxuLgcMHyptfawuZX4pJSWZTnfnu/lnIe/jNNxHHGNn//HNbbv+4dr6V+11uF527arU7+u63qfa/bnmh8sWLBgwYJlqRf8MEptXPBXJXa37BSl3ixYsGDBMliwFLyCV/DeLIMFCxYsWLBMwSt4Be/NggXLYMGCBUvBK3iNruC9WbBgwYJlsGApeAWv4L1ZBgsWLFiwYJmCV/AK3psFC5bBggULloJX8BpdwXuzYMGCBctgwVLwCl7Be7MMFixYsGDBsu8FH1FaSmExVfAxBa/gvVmwYMGCZbBg/W4vAQYA5tRF9QYlv/QAAAAASUVORK5CYII=";

        static link_type_colors = {
            "-1": LiteGraph.EVENT_LINK_COLOR,
            number: "#AAA",
            node: "#DCA"
        };
        static gradients = {}; //cache of gradients

        static search_limit = -1;
        static node_colors = {
            red: { color: "#322", bgcolor: "#533", groupcolor: "#A88" },
            brown: { color: "#332922", bgcolor: "#593930", groupcolor: "#b06634" },
            green: { color: "#232", bgcolor: "#353", groupcolor: "#8A8" },
            blue: { color: "#223", bgcolor: "#335", groupcolor: "#88A" },
            pale_blue: {
                color: "#2a363b",
                bgcolor: "#3f5159",
                groupcolor: "#3f789e"
            },
            cyan: { color: "#233", bgcolor: "#355", groupcolor: "#8AA" },
            purple: { color: "#323", bgcolor: "#535", groupcolor: "#a1309b" },
            yellow: { color: "#432", bgcolor: "#653", groupcolor: "#b58b2a" },
            black: { color: "#222", bgcolor: "#000", groupcolor: "#444" }
        };

        constructor(canvas, graph, options) {
            this.options = options = options || {};

            //if(graph === undefined)
            //	throw ("No graph assigned");
            this.background_image = LGraphCanvas.DEFAULT_BACKGROUND_IMAGE;

            if (canvas && canvas.constructor === String) {
                canvas = document.querySelector(canvas);
            }

            this.ds = new DragAndScale();
            this.zoom_modify_alpha = true; //otherwise it generates ugly patterns when scaling down too much
            this.zoom_speed = 1.1 // in range (1.01, 2.5). Less than 1 will invert the zoom direction

            this.title_text_font = "" + LiteGraph.NODE_TEXT_SIZE + "px Arial";
            this.inner_text_font =
                "normal " + LiteGraph.NODE_SUBTEXT_SIZE + "px Arial";
            this.node_title_color = LiteGraph.NODE_TITLE_COLOR;
            this.default_link_color = LiteGraph.LINK_COLOR;
            this.default_connection_color = {
                input_off: "#778",
                input_on: "#7F7", //"#BBD"
                output_off: "#778",
                output_on: "#7F7" //"#BBD"
            };
            this.default_connection_color_byType = {
                /*number: "#7F7",
                string: "#77F",
                boolean: "#F77",*/
            };
            this.default_connection_color_byTypeOff = {
                /*number: "#474",
                string: "#447",
                boolean: "#744",*/
            };

            this.highquality_render = true;
            this.use_gradients = false; //set to true to render titlebar with gradients
            this.editor_alpha = 1; //used for transition
            this.pause_rendering = false;
            this.clear_background = true;
            this.clear_background_color = "#222";

            this.read_only = false; //if set to true users cannot modify the graph
            this.render_only_selected = true;
            this.live_mode = false;
            this.show_info = true;
            this.allow_dragcanvas = true;
            this.allow_dragnodes = true;
            this.allow_interaction = true; //allow to control widgets, buttons, collapse, etc
            this.multi_select = false; //allow selecting multi nodes without pressing extra keys
            this.allow_searchbox = true;
            this.allow_reconnect_links = true; //allows to change a connection with having to redo it again
            this.align_to_grid = false; //snap to grid

            this.drag_mode = false;
            this.dragging_rectangle = null;

            this.filter = null; //allows to filter to only accept some type of nodes in a graph

            this.set_canvas_dirty_on_mouse_event = true; //forces to redraw the canvas on mouse events (except move)
            this.always_render_background = false;
            this.render_shadows = true;
            this.render_canvas_border = true;
            this.render_connections_shadows = false; //too much cpu
            this.render_connections_border = true;
            this.render_curved_connections = false;
            this.render_connection_arrows = false;
            this.render_collapsed_slots = true;
            this.render_execution_order = false;
            this.render_title_colored = true;
            this.render_link_tooltip = true;

            this.links_render_mode = LiteGraph.SPLINE_LINK;

            this.mouse = [0, 0]; //mouse in canvas coordinates, where 0,0 is the top-left corner of the blue rectangle
            this.graph_mouse = [0, 0]; //mouse in graph coordinates, where 0,0 is the top-left corner of the blue rectangle
            this.canvas_mouse = this.graph_mouse; //LEGACY: REMOVE THIS, USE GRAPH_MOUSE INSTEAD


            //to personalize the search box
            this.onSearchBox = null;
            this.onSearchBoxSelection = null;

            //callbacks
            this.onMouse = null;
            this.onDrawBackground = null; //to render background objects (behind nodes and connections) in the canvas affected by transform
            this.onDrawForeground = null; //to render foreground objects (above nodes and connections) in the canvas affected by transform
            this.onDrawOverlay = null; //to render foreground objects not affected by transform (for GUIs)
            this.onDrawLinkTooltip = null; //called when rendering a tooltip
            this.onNodeMoved = null; //called after moving a node
            this.onSelectionChange = null; //called if the selection changes
            this.onConnectingChange = null; //called before any link changes
            this.onBeforeChange = null; //called before modifying the graph
            this.onAfterChange = null; //called after modifying the graph

            this.connections_width = 3;
            this.round_radius = 8;

            this.current_node = null;
            this.node_widget = null; //used for widgets
            this.over_link_center = null;
            this.last_mouse_position = [0, 0];
            this.visible_area = this.ds.visible_area;
            this.visible_links = [];
            this.connecting_links = null; // Explicitly null-checked

            this.viewport = options.viewport || null; //to constraint render area to a portion of the canvas


            //link canvas and graph
            if (graph) {
                graph.attachCanvas(this);
            }

            this.setCanvas(canvas, options.skip_events);
            this.clear();

            if (!options.skip_render) {
                this.startRendering();
            }

            this.autoresize = options.autoresize;
        }
        static getFileExtension(url) {
            var question = url.indexOf("?");
            if (question != -1) {
                url = url.substr(0, question);
            }
            var point = url.lastIndexOf(".");
            if (point == -1) {
                return "";
            }
            return url.substr(point + 1).toLowerCase();
        }
        /* this is an implementation for touch not in production and not ready
             */
        /*LGraphCanvas.prototype.touchHandler = function(event) {
                //alert("foo");
                var touches = event.changedTouches,
                    first = touches[0],
                    type = "";
        
                switch (event.type) {
                    case "touchstart":
                        type = "mousedown";
                        break;
                    case "touchmove":
                        type = "mousemove";
                        break;
                    case "touchend":
                        type = "mouseup";
                        break;
                    default:
                        return;
                }
        
                //initMouseEvent(type, canBubble, cancelable, view, clickCount,
                //           screenX, screenY, clientX, clientY, ctrlKey,
                //           altKey, shiftKey, metaKey, button, relatedTarget);
        
                // this is eventually a Dom object, get the LGraphCanvas back
                if(typeof this.getCanvasWindow == "undefined"){
                    var window = this.lgraphcanvas.getCanvasWindow();
                }else{
                    var window = this.getCanvasWindow();
                }
                
                var document = window.document;
        
                var simulatedEvent = document.createEvent("MouseEvent");
                simulatedEvent.initMouseEvent(
                    type,
                    true,
                    true,
                    window,
                    1,
                    first.screenX,
                    first.screenY,
                    first.clientX,
                    first.clientY,
                    false,
                    false,
                    false,
                    false,
                    0, //left
                    null
                );
                first.target.dispatchEvent(simulatedEvent);
                event.preventDefault();
            };*/
        /* CONTEXT MENU ********************/
        static onGroupAdd(info, entry, mouse_event) {
            var canvas = LGraphCanvas.active_canvas;
            var ref_window = canvas.getCanvasWindow();

            var group = new LiteGraph.LGraphGroup();
            group.pos = canvas.convertEventToCanvasOffset(mouse_event);
            canvas.graph.add(group);
        }
        /**
             * Determines the furthest nodes in each direction
             * @param nodes {LGraphNode[]} the nodes to from which boundary nodes will be extracted
             * @return {{left: LGraphNode, top: LGraphNode, right: LGraphNode, bottom: LGraphNode}}
             */
        static getBoundaryNodes(nodes) {
            let top = null;
            let right = null;
            let bottom = null;
            let left = null;
            for (const nID in nodes) {
                const node = nodes[nID];
                const [x, y] = node.pos;
                const [width, height] = node.size;

                if (top === null || y < top.pos[1]) {
                    top = node;
                }
                if (right === null || x + width > right.pos[0] + right.size[0]) {
                    right = node;
                }
                if (bottom === null || y + height > bottom.pos[1] + bottom.size[1]) {
                    bottom = node;
                }
                if (left === null || x < left.pos[0]) {
                    left = node;
                }
            }

            return {
                "top": top,
                "right": right,
                "bottom": bottom,
                "left": left
            };
        }
        /**
             *
             * @param {LGraphNode[]} nodes a list of nodes
             * @param {"top"|"bottom"|"left"|"right"} direction Direction to align the nodes
             * @param {LGraphNode?} align_to Node to align to (if null, align to the furthest node in the given direction)
             */
        static alignNodes(nodes, direction, align_to) {
            if (!nodes) {
                return;
            }

            const canvas = LGraphCanvas.active_canvas;
            let boundaryNodes = [];
            if (align_to === undefined) {
                boundaryNodes = LGraphCanvas.getBoundaryNodes(nodes);
            } else {
                boundaryNodes = {
                    "top": align_to,
                    "right": align_to,
                    "bottom": align_to,
                    "left": align_to
                };
            }

            for (const [_, node] of Object.entries(canvas.selected_nodes)) {
                switch (direction) {
                    case "right":
                        node.pos[0] = boundaryNodes["right"].pos[0] + boundaryNodes["right"].size[0] - node.size[0];
                        break;
                    case "left":
                        node.pos[0] = boundaryNodes["left"].pos[0];
                        break;
                    case "top":
                        node.pos[1] = boundaryNodes["top"].pos[1];
                        break;
                    case "bottom":
                        node.pos[1] = boundaryNodes["bottom"].pos[1] + boundaryNodes["bottom"].size[1] - node.size[1];
                        break;
                }
            }

            canvas.dirty_canvas = true;
            canvas.dirty_bgcanvas = true;
        }
        static onNodeAlign(value, options, event, prev_menu, node) {
            new LiteGraph.ContextMenu(["Top", "Bottom", "Left", "Right"], {
                event: event,
                callback: inner_clicked,
                parentMenu: prev_menu,
            });

            function inner_clicked(value) {
                LGraphCanvas.alignNodes(LGraphCanvas.active_canvas.selected_nodes, value.toLowerCase(), node);
            }
        }
        static onGroupAlign(value, options, event, prev_menu) {
            new LiteGraph.ContextMenu(["Top", "Bottom", "Left", "Right"], {
                event: event,
                callback: inner_clicked,
                parentMenu: prev_menu,
            });

            function inner_clicked(value) {
                LGraphCanvas.alignNodes(LGraphCanvas.active_canvas.selected_nodes, value.toLowerCase());
            }
        }
        static onMenuAdd(node, options, e, prev_menu, callback) {

            var canvas = LGraphCanvas.active_canvas;
            var ref_window = canvas.getCanvasWindow();
            var graph = canvas.graph;
            if (!graph)
                return;

            function inner_onMenuAdded(base_category, prev_menu) {

                var categories = LiteGraph.getNodeTypesCategories(canvas.filter || graph.filter).filter(function (category) { return category.startsWith(base_category); });
                var entries = [];

                categories.map(function (category) {

                    if (!category)
                        return;

                    var base_category_regex = new RegExp('^(' + base_category + ')');
                    var category_name = category.replace(base_category_regex, "").split('/')[0];
                    var category_path = base_category === '' ? category_name + '/' : base_category + category_name + '/';

                    var name = category_name;
                    if (name.indexOf("::") != -1) //in case it has a namespace like "shader::math/rand" it hides the namespace
                        name = name.split("::")[1];

                    var index = entries.findIndex(function (entry) { return entry.value === category_path; });
                    if (index === -1) {
                        entries.push({
                            value: category_path, content: name, has_submenu: true, callback: function (value, event, mouseEvent, contextMenu) {
                                inner_onMenuAdded(value.value, contextMenu);
                            }
                        });
                    }

                });

                var nodes = LiteGraph.getNodeTypesInCategory(base_category.slice(0, -1), canvas.filter || graph.filter);
                nodes.map(function (node) {

                    if (node.skip_list)
                        return;

                    var entry = {
                        value: node.type, content: node.title, has_submenu: false, callback: function (value, event, mouseEvent, contextMenu) {

                            var first_event = contextMenu.getFirstEvent();
                            canvas.graph.beforeChange();
                            var node = LiteGraph.createNode(value.value);
                            if (node) {
                                node.pos = canvas.convertEventToCanvasOffset(first_event);
                                canvas.graph.add(node);
                            }
                            if (callback)
                                callback(node);
                            canvas.graph.afterChange();

                        }
                    };

                    entries.push(entry);

                });

                new LiteGraph.ContextMenu(entries, { event: e, parentMenu: prev_menu }, ref_window);

            }

            inner_onMenuAdded('', prev_menu);
            return false;

        }
        static onMenuCollapseAll() { }
        static onMenuNodeEdit() { }
        static showMenuNodeOptionalInputs(v,
            options,
            e,
            prev_menu,
            node) {
            if (!node) {
                return;
            }

            var that = this;
            var canvas = LGraphCanvas.active_canvas;
            var ref_window = canvas.getCanvasWindow();

            var options = node.optional_inputs;
            if (node.onGetInputs) {
                options = node.onGetInputs();
            }

            var entries = [];
            if (options) {
                for (var i = 0; i < options.length; i++) {
                    var entry = options[i];
                    if (!entry) {
                        entries.push(null);
                        continue;
                    }
                    var label = entry[0];
                    if (!entry[2])
                        entry[2] = {};

                    if (entry[2].label) {
                        label = entry[2].label;
                    }

                    entry[2].removable = true;
                    var data = { content: label, value: entry };
                    if (entry[1] == LiteGraph.ACTION) {
                        data.className = "event";
                    }
                    entries.push(data);
                }
            }

            if (node.onMenuNodeInputs) {
                var retEntries = node.onMenuNodeInputs(entries);
                if (retEntries) entries = retEntries;
            }

            if (!entries.length) {
                console.log("no input entries");
                return;
            }

            var menu = new LiteGraph.ContextMenu(
                entries,
                {
                    event: e,
                    callback: inner_clicked,
                    parentMenu: prev_menu,
                    node: node
                },
                ref_window
            );

            function inner_clicked(v, e, prev) {
                if (!node) {
                    return;
                }

                if (v.callback) {
                    v.callback.call(that, node, v, e, prev);
                }

                if (v.value) {
                    node.graph.beforeChange();
                    node.addInput(v.value[0], v.value[1], v.value[2]);

                    if (node.onNodeInputAdd) { // callback to the node when adding a slot
                        node.onNodeInputAdd(v.value);
                    }
                    node.setDirtyCanvas(true, true);
                    node.graph.afterChange();
                }
            }

            return false;
        }
        static showMenuNodeOptionalOutputs(v,
            options,
            e,
            prev_menu,
            node) {
            if (!node) {
                return;
            }

            var that = this;
            var canvas = LGraphCanvas.active_canvas;
            var ref_window = canvas.getCanvasWindow();

            var options = node.optional_outputs;
            if (node.onGetOutputs) {
                options = node.onGetOutputs();
            }

            var entries = [];
            if (options) {
                for (var i = 0; i < options.length; i++) {
                    var entry = options[i];
                    if (!entry) {
                        //separator?
                        entries.push(null);
                        continue;
                    }

                    if (node.flags &&
                        node.flags.skip_repeated_outputs &&
                        node.findOutputSlot(entry[0]) != -1) {
                        continue;
                    } //skip the ones already on
                    var label = entry[0];
                    if (!entry[2])
                        entry[2] = {};
                    if (entry[2].label) {
                        label = entry[2].label;
                    }
                    entry[2].removable = true;
                    var data = { content: label, value: entry };
                    if (entry[1] == LiteGraph.EVENT) {
                        data.className = "event";
                    }
                    entries.push(data);
                }
            }

            if (this.onMenuNodeOutputs) {
                entries = this.onMenuNodeOutputs(entries);
            }
            if (LiteGraph.do_add_triggers_slots) { //canvas.allow_addOutSlot_onExecuted
                if (node.findOutputSlot("onExecuted") == -1) {
                    entries.push({ content: "On Executed", value: ["onExecuted", LiteGraph.EVENT, { nameLocked: true }], className: "event" }); //, opts: {}
                }
            }
            // add callback for modifing the menu elements onMenuNodeOutputs
            if (node.onMenuNodeOutputs) {
                var retEntries = node.onMenuNodeOutputs(entries);
                if (retEntries) entries = retEntries;
            }

            if (!entries.length) {
                return;
            }

            var menu = new LiteGraph.ContextMenu(
                entries,
                {
                    event: e,
                    callback: inner_clicked,
                    parentMenu: prev_menu,
                    node: node
                },
                ref_window
            );

            function inner_clicked(v, e, prev) {
                if (!node) {
                    return;
                }

                if (v.callback) {
                    v.callback.call(that, node, v, e, prev);
                }

                if (!v.value) {
                    return;
                }

                var value = v.value[1];

                if (value &&
                    (value.constructor === Object || value.constructor === Array)) {
                    //submenu why?
                    var entries = [];
                    for (var i in value) {
                        entries.push({ content: i, value: value[i] });
                    }
                    new LiteGraph.ContextMenu(entries, {
                        event: e,
                        callback: inner_clicked,
                        parentMenu: prev_menu,
                        node: node
                    });
                    return false;
                } else {
                    node.graph.beforeChange();
                    node.addOutput(v.value[0], v.value[1], v.value[2]);

                    if (node.onNodeOutputAdd) { // a callback to the node when adding a slot
                        node.onNodeOutputAdd(v.value);
                    }
                    node.setDirtyCanvas(true, true);
                    node.graph.afterChange();
                }
            }

            return false;
        }
        static onShowMenuNodeProperties(value,
            options,
            e,
            prev_menu,
            node) {
            if (!node || !node.properties) {
                return;
            }

            var that = this;
            var canvas = LGraphCanvas.active_canvas;
            var ref_window = canvas.getCanvasWindow();

            var entries = [];
            for (var i in node.properties) {
                var value = node.properties[i] !== undefined ? node.properties[i] : " ";
                if (typeof value == "object")
                    value = JSON.stringify(value);
                var info = node.getPropertyInfo(i);
                if (info.type == "enum" || info.type == "combo")
                    value = LGraphCanvas.getPropertyPrintableValue(value, info.values);

                //value could contain invalid html characters, clean that
                value = LGraphCanvas.decodeHTML(value);
                entries.push({
                    content: "<span class='property_name'>" +
                        (info.label ? info.label : i) +
                        "</span>" +
                        "<span class='property_value'>" +
                        value +
                        "</span>",
                    value: i
                });
            }
            if (!entries.length) {
                return;
            }

            var menu = new LiteGraph.ContextMenu(
                entries,
                {
                    event: e,
                    callback: inner_clicked,
                    parentMenu: prev_menu,
                    allow_html: true,
                    node: node
                },
                ref_window
            );

            function inner_clicked(v, options, e, prev) {
                if (!node) {
                    return;
                }
                var rect = this.getBoundingClientRect();
                canvas.showEditPropertyValue(node, v.value, {
                    position: [rect.left, rect.top]
                });
            }

            return false;
        }
        static decodeHTML(str) {
            var e = document.createElement("div");
            e.innerText = str;
            return e.innerHTML;
        }
        static onMenuResizeNode(value, options, e, menu, node) {
            if (!node) {
                return;
            }

            var fApplyMultiNode = function (node) {
                node.size = node.computeSize();
                if (node.onResize)
                    node.onResize(node.size);
            };

            var graphcanvas = LGraphCanvas.active_canvas;
            if (!graphcanvas.selected_nodes || Object.keys(graphcanvas.selected_nodes).length <= 1) {
                fApplyMultiNode(node);
            } else {
                for (var i in graphcanvas.selected_nodes) {
                    fApplyMultiNode(graphcanvas.selected_nodes[i]);
                }
            }

            node.setDirtyCanvas(true, true);
        }
        // TODO refactor :: this is used fot title but not for properties!
        static onShowPropertyEditor(item, options, e, menu, node) {
            var input_html = "";
            var property = item.property || "title";
            var value = node[property];

            // TODO refactor :: use createDialog ?
            var dialog = document.createElement("div");
            dialog.is_modified = false;
            dialog.className = "graphdialog";
            dialog.innerHTML =
                "<span class='name'></span><input autofocus type='text' class='value'/><button>OK</button>";
            dialog.close = function () {
                if (dialog.parentNode) {
                    dialog.parentNode.removeChild(dialog);
                }
            };
            var title = dialog.querySelector(".name");
            title.innerText = property;
            var input = dialog.querySelector(".value");
            if (input) {
                input.value = value;
                input.addEventListener("blur", function (e) {
                    this.focus();
                });
                input.addEventListener("keydown", function (e) {
                    dialog.is_modified = true;
                    if (e.keyCode == 27) {
                        //ESC
                        dialog.close();
                    } else if (e.keyCode == 13) {
                        inner(); // save
                    } else if (e.keyCode != 13 && e.target.localName != "textarea") {
                        return;
                    }
                    e.preventDefault();
                    e.stopPropagation();
                });
            }

            var graphcanvas = LGraphCanvas.active_canvas;
            var canvas = graphcanvas.canvas;

            var rect = canvas.getBoundingClientRect();
            var offsetx = -20;
            var offsety = -20;
            if (rect) {
                offsetx -= rect.left;
                offsety -= rect.top;
            }

            if (event) {
                dialog.style.left = event.clientX + offsetx + "px";
                dialog.style.top = event.clientY + offsety + "px";
            } else {
                dialog.style.left = canvas.width * 0.5 + offsetx + "px";
                dialog.style.top = canvas.height * 0.5 + offsety + "px";
            }

            var button = dialog.querySelector("button");
            button.addEventListener("click", inner);
            canvas.parentNode.appendChild(dialog);

            if (input) input.focus();

            var dialogCloseTimer = null;
            dialog.addEventListener("mouseleave", function (e) {
                if (LiteGraph.dialog_close_on_mouse_leave)
                    if (!dialog.is_modified && LiteGraph.dialog_close_on_mouse_leave)
                        dialogCloseTimer = setTimeout(dialog.close, LiteGraph.dialog_close_on_mouse_leave_delay); //dialog.close();
            });
            dialog.addEventListener("mouseenter", function (e) {
                if (LiteGraph.dialog_close_on_mouse_leave)
                    if (dialogCloseTimer) clearTimeout(dialogCloseTimer);
            });

            function inner() {
                if (input) setValue(input.value);
            }

            function setValue(value) {
                if (item.type == "Number") {
                    value = Number(value);
                } else if (item.type == "Boolean") {
                    value = Boolean(value);
                }
                node[property] = value;
                if (dialog.parentNode) {
                    dialog.parentNode.removeChild(dialog);
                }
                node.setDirtyCanvas(true, true);
            }
        }
        static getPropertyPrintableValue(value, values) {
            if (!values)
                return String(value);

            if (values.constructor === Array) {
                return String(value);
            }

            if (values.constructor === Object) {
                var desc_value = "";
                for (var k in values) {
                    if (values[k] != value)
                        continue;
                    desc_value = k;
                    break;
                }
                return String(value) + " (" + desc_value + ")";
            }
        }
        static onMenuNodeCollapse(value, options, e, menu, node) {
            node.graph.beforeChange( /*?*/);

            var fApplyMultiNode = function (node) {
                node.collapse();
            };

            var graphcanvas = LGraphCanvas.active_canvas;
            if (!graphcanvas.selected_nodes || Object.keys(graphcanvas.selected_nodes).length <= 1) {
                fApplyMultiNode(node);
            } else {
                for (var i in graphcanvas.selected_nodes) {
                    fApplyMultiNode(graphcanvas.selected_nodes[i]);
                }
            }

            node.graph.afterChange( /*?*/);
        }
        static onMenuNodePin(value, options, e, menu, node) {
        }
        static onMenuNodeMode(value, options, e, menu, node) {
            new LiteGraph.ContextMenu(
                LiteGraph.NODE_MODES,
                { event: e, callback: inner_clicked, parentMenu: menu, node: node }
            );

            function inner_clicked(v) {
                if (!node) {
                    return;
                }
                var kV = Object.values(LiteGraph.NODE_MODES).indexOf(v);
                var fApplyMultiNode = function (node) {
                    if (kV >= 0 && LiteGraph.NODE_MODES[kV])
                        node.changeMode(kV);
                    else {
                        console.warn("unexpected mode: " + v);
                        node.changeMode(LiteGraph.ALWAYS);
                    }
                };

                var graphcanvas = LGraphCanvas.active_canvas;
                if (!graphcanvas.selected_nodes || Object.keys(graphcanvas.selected_nodes).length <= 1) {
                    fApplyMultiNode(node);
                } else {
                    for (var i in graphcanvas.selected_nodes) {
                        fApplyMultiNode(graphcanvas.selected_nodes[i]);
                    }
                }
            }

            return false;
        }
        static onMenuNodeColors(value, options, e, menu, node) {
            if (!node) {
                throw "no node for color";
            }

            var values = [];
            values.push({
                value: null,
                content: "<span style='display: block; padding-left: 4px;'>No color</span>"
            });

            for (var i in LGraphCanvas.node_colors) {
                var color = LGraphCanvas.node_colors[i];
                var value = {
                    value: i,
                    content: "<span style='display: block; color: #999; padding-left: 4px; border-left: 8px solid " +
                        color.color +
                        "; background-color:" +
                        color.bgcolor +
                        "'>" +
                        i +
                        "</span>"
                };
                values.push(value);
            }
            new LiteGraph.ContextMenu(values, {
                event: e,
                callback: inner_clicked,
                parentMenu: menu,
                node: node
            });

            function inner_clicked(v) {
                if (!node) {
                    return;
                }

                var color = v.value ? LGraphCanvas.node_colors[v.value] : null;

                var fApplyColor = function (node) {
                    if (color) {
                        if (node.constructor === LiteGraph.LGraphGroup) {
                            node.color = color.groupcolor;
                        } else {
                            node.color = color.color;
                            node.bgcolor = color.bgcolor;
                        }
                    } else {
                        delete node.color;
                        delete node.bgcolor;
                    }
                };

                var graphcanvas = LGraphCanvas.active_canvas;
                if (!graphcanvas.selected_nodes || Object.keys(graphcanvas.selected_nodes).length <= 1) {
                    fApplyColor(node);
                } else {
                    for (var i in graphcanvas.selected_nodes) {
                        fApplyColor(graphcanvas.selected_nodes[i]);
                    }
                }
                node.setDirtyCanvas(true, true);
            }

            return false;
        }
        static onMenuNodeShapes(value, options, e, menu, node) {
            if (!node) {
                throw "no node passed";
            }

            new LiteGraph.ContextMenu(LiteGraph.VALID_SHAPES, {
                event: e,
                callback: inner_clicked,
                parentMenu: menu,
                node: node
            });

            function inner_clicked(v) {
                if (!node) {
                    return;
                }
                node.graph.beforeChange( /*?*/); //node

                var fApplyMultiNode = function (node) {
                    node.shape = v;
                };

                var graphcanvas = LGraphCanvas.active_canvas;
                if (!graphcanvas.selected_nodes || Object.keys(graphcanvas.selected_nodes).length <= 1) {
                    fApplyMultiNode(node);
                } else {
                    for (var i in graphcanvas.selected_nodes) {
                        fApplyMultiNode(graphcanvas.selected_nodes[i]);
                    }
                }

                node.graph.afterChange( /*?*/); //node
                node.setDirtyCanvas(true);
            }

            return false;
        }
        static onMenuNodeRemove(value, options, e, menu, node) {
            if (!node) {
                throw "no node passed";
            }

            var graph = node.graph;
            graph.beforeChange();


            var fApplyMultiNode = function (node) {
                if (node.removable === false) {
                    return;
                }
                graph.remove(node);
            };

            var graphcanvas = LGraphCanvas.active_canvas;
            if (!graphcanvas.selected_nodes || Object.keys(graphcanvas.selected_nodes).length <= 1) {
                fApplyMultiNode(node);
            } else {
                for (var i in graphcanvas.selected_nodes) {
                    fApplyMultiNode(graphcanvas.selected_nodes[i]);
                }
            }

            graph.afterChange();
            node.setDirtyCanvas(true, true);
        }
        static onMenuNodeToSubgraph(value, options, e, menu, node) {
            var graph = node.graph;
            var graphcanvas = LGraphCanvas.active_canvas;
            if (!graphcanvas) //??
                return;

            var nodes_list = Object.values(graphcanvas.selected_nodes || {});
            if (!nodes_list.length)
                nodes_list = [node];

            var subgraph_node = LiteGraph.createNode("graph/subgraph");
            subgraph_node.pos = node.pos.concat();
            graph.add(subgraph_node);

            subgraph_node.buildFromNodes(nodes_list);

            graphcanvas.deselectAllNodes();
            node.setDirtyCanvas(true, true);
        }
        static onMenuNodeClone(value, options, e, menu, node) {

            node.graph.beforeChange();

            var newSelected = {};

            var fApplyMultiNode = function (node) {
                if (node.clonable === false) {
                    return;
                }
                var newnode = node.clone();
                if (!newnode) {
                    return;
                }
                newnode.pos = [node.pos[0] + 5, node.pos[1] + 5];
                node.graph.add(newnode);
                newSelected[newnode.id] = newnode;
            };

            var graphcanvas = LGraphCanvas.active_canvas;
            if (!graphcanvas.selected_nodes || Object.keys(graphcanvas.selected_nodes).length <= 1) {
                fApplyMultiNode(node);
            } else {
                for (var i in graphcanvas.selected_nodes) {
                    fApplyMultiNode(graphcanvas.selected_nodes[i]);
                }
            }

            if (Object.keys(newSelected).length) {
                graphcanvas.selectNodes(newSelected);
            }

            node.graph.afterChange();

            node.setDirtyCanvas(true, true);
        }
        /**
             * clears all the data inside
             *
             * @method clear
             */
        clear() {
            this.frame = 0;
            this.last_draw_time = 0;
            this.render_time = 0;
            this.fps = 0;

            //this.scale = 1;
            //this.offset = [0,0];
            this.dragging_rectangle = null;

            this.selected_nodes = {};
            this.selected_group = null;

            this.visible_nodes = [];
            this.node_dragged = null;
            this.node_over = null;
            this.node_capturing_input = null;
            this.connecting_links = null;
            this.highlighted_links = {};

            this.dragging_canvas = false;

            this.dirty_canvas = true;
            this.dirty_bgcanvas = true;
            this.dirty_area = null;

            this.node_in_panel = null;
            this.node_widget = null;

            this.last_mouse = [0, 0];
            this.last_mouseclick = 0;
            this.pointer_is_down = false;
            this.pointer_is_double = false;
            this.visible_area.set([0, 0, 0, 0]);

            if (this.onClear) {
                this.onClear();
            }
        }
        /**
             * assigns a graph, you can reassign graphs to the same canvas
             *
             * @method setGraph
             * @param {LGraph} graph
             */
        setGraph(graph, skip_clear) {
            if (this.graph == graph) {
                return;
            }

            if (!skip_clear) {
                this.clear();
            }

            if (!graph && this.graph) {
                this.graph.detachCanvas(this);
                return;
            }

            graph.attachCanvas(this);

            //remove the graph stack in case a subgraph was open
            if (this._graph_stack)
                this._graph_stack = null;

            this.setDirty(true, true);
        }
        /**
             * returns the top level graph (in case there are subgraphs open on the canvas)
             *
             * @method getTopGraph
             * @return {LGraph} graph
             */
        getTopGraph() {
            if (this._graph_stack.length)
                return this._graph_stack[0];
            return this.graph;
        }
        /**
             * opens a graph contained inside a node in the current graph
             *
             * @method openSubgraph
             * @param {LGraph} graph
             */
        openSubgraph(graph) {
            if (!graph) {
                throw "graph cannot be null";
            }

            if (this.graph == graph) {
                throw "graph cannot be the same";
            }

            this.clear();

            if (this.graph) {
                if (!this._graph_stack) {
                    this._graph_stack = [];
                }
                this._graph_stack.push(this.graph);
            }

            graph.attachCanvas(this);
            this.checkPanels();
            this.setDirty(true, true);
        }
        /**
             * closes a subgraph contained inside a node
             *
             * @method closeSubgraph
             * @param {LGraph} assigns a graph
             */
        closeSubgraph() {
            if (!this._graph_stack || this._graph_stack.length == 0) {
                return;
            }
            var subgraph_node = this.graph._subgraph_node;
            var graph = this._graph_stack.pop();
            this.selected_nodes = {};
            this.highlighted_links = {};
            graph.attachCanvas(this);
            this.setDirty(true, true);
            if (subgraph_node) {
                this.centerOnNode(subgraph_node);
                this.selectNodes([subgraph_node]);
            }
            // when close sub graph back to offset [0, 0] scale 1
            this.ds.offset = [0, 0];
            this.ds.scale = 1;
        }
        /**
             * returns the visually active graph (in case there are more in the stack)
             * @method getCurrentGraph
             * @return {LGraph} the active graph
             */
        getCurrentGraph() {
            return this.graph;
        }
        /**
             * assigns a canvas
             *
             * @method setCanvas
             * @param {Canvas} assigns a canvas (also accepts the ID of the element (not a selector)
             */
        setCanvas(canvas, skip_events) {
            var that = this;

            if (canvas) {
                if (canvas.constructor === String) {
                    canvas = document.getElementById(canvas);
                    if (!canvas) {
                        throw "Error creating LiteGraph canvas: Canvas not found";
                    }
                }
            }

            if (canvas === this.canvas) {
                return;
            }

            if (!canvas && this.canvas) {
                //maybe detach events from old_canvas
                if (!skip_events) {
                    this.unbindEvents();
                }
            }

            this.canvas = canvas;
            this.ds.element = canvas;

            if (!canvas) {
                return;
            }

            //this.canvas.tabindex = "1000";
            canvas.className += " lgraphcanvas";
            canvas.data = this;
            canvas.tabindex = "1"; //to allow key events


            //bg canvas: used for non changing stuff
            this.bgcanvas = null;
            if (!this.bgcanvas) {
                this.bgcanvas = document.createElement("canvas");
                this.bgcanvas.width = this.canvas.width;
                this.bgcanvas.height = this.canvas.height;
            }

            if (canvas.getContext == null) {
                if (canvas.localName != "canvas") {
                    throw "Element supplied for LGraphCanvas must be a <canvas> element, you passed a " +
                    canvas.localName;
                }
                throw "This browser doesn't support Canvas";
            }

            var ctx = (this.ctx = canvas.getContext("2d"));
            if (ctx == null) {
                if (!canvas.webgl_enabled) {
                    console.warn(
                        "This canvas seems to be WebGL, enabling WebGL renderer"
                    );
                }
                this.enableWebGL();
            }

            //input:  (move and up could be unbinded)
            // why here? this._mousemove_callback = this.processMouseMove.bind(this);
            // why here? this._mouseup_callback = this.processMouseUp.bind(this);
            if (!skip_events) {
                this.bindEvents();
            }
        }
        //used in some events to capture them
        _doNothing(e) {
            //console.log("pointerevents: _doNothing "+e.type);
            e.preventDefault();
            return false;
        }
        _doReturnTrue(e) {
            e.preventDefault();
            return true;
        }
        /**
             * binds mouse, keyboard, touch and drag events to the canvas
             * @method bindEvents
             **/
        bindEvents() {
            if (this._events_binded) {
                console.warn("LGraphCanvas: events already binded");
                return;
            }

            //console.log("pointerevents: bindEvents");
            var canvas = this.canvas;

            var ref_window = this.getCanvasWindow();
            var document = ref_window.document; //hack used when moving canvas between windows

            this._mousedown_callback = this.processMouseDown.bind(this);
            this._mousewheel_callback = this.processMouseWheel.bind(this);
            // why mousemove and mouseup were not binded here?
            this._mousemove_callback = this.processMouseMove.bind(this);
            this._mouseup_callback = this.processMouseUp.bind(this);

            //touch events -- TODO IMPLEMENT
            //this._touch_callback = this.touchHandler.bind(this);
            LiteGraph.pointerListenerAdd(canvas, "down", this._mousedown_callback, true); //down do not need to store the binded
            canvas.addEventListener("mousewheel", this._mousewheel_callback, false);

            LiteGraph.pointerListenerAdd(canvas, "up", this._mouseup_callback, true); // CHECK: ??? binded or not
            LiteGraph.pointerListenerAdd(canvas, "move", this._mousemove_callback);

            canvas.addEventListener("contextmenu", this._doNothing);
            canvas.addEventListener(
                "DOMMouseScroll",
                this._mousewheel_callback,
                false
            );

            //touch events -- THIS WAY DOES NOT WORK, finish implementing pointerevents, than clean the touchevents
            /*if( 'touchstart' in document.documentElement )
            {
                canvas.addEventListener("touchstart", this._touch_callback, true);
                canvas.addEventListener("touchmove", this._touch_callback, true);
                canvas.addEventListener("touchend", this._touch_callback, true);
                canvas.addEventListener("touchcancel", this._touch_callback, true);
            }*/
            //Keyboard ******************
            this._key_callback = this.processKey.bind(this);

            canvas.addEventListener("keydown", this._key_callback, true);
            document.addEventListener("keyup", this._key_callback, true); //in document, otherwise it doesn't fire keyup


            //Dropping Stuff over nodes ************************************
            this._ondrop_callback = this.processDrop.bind(this);

            canvas.addEventListener("dragover", this._doNothing, false);
            canvas.addEventListener("dragend", this._doNothing, false);
            canvas.addEventListener("drop", this._ondrop_callback, false);
            canvas.addEventListener("dragenter", this._doReturnTrue, false);

            this._events_binded = true;
        }
        /**
             * unbinds mouse events from the canvas
             * @method unbindEvents
             **/
        unbindEvents() {
            if (!this._events_binded) {
                console.warn("LGraphCanvas: no events binded");
                return;
            }

            //console.log("pointerevents: unbindEvents");
            var ref_window = this.getCanvasWindow();
            var document = ref_window.document;

            LiteGraph.pointerListenerRemove(this.canvas, "move", this._mousemove_callback);
            LiteGraph.pointerListenerRemove(this.canvas, "up", this._mouseup_callback);
            LiteGraph.pointerListenerRemove(this.canvas, "down", this._mousedown_callback);
            this.canvas.removeEventListener(
                "mousewheel",
                this._mousewheel_callback
            );
            this.canvas.removeEventListener(
                "DOMMouseScroll",
                this._mousewheel_callback
            );
            this.canvas.removeEventListener("keydown", this._key_callback);
            document.removeEventListener("keyup", this._key_callback);
            this.canvas.removeEventListener("contextmenu", this._doNothing);
            this.canvas.removeEventListener("drop", this._ondrop_callback);
            this.canvas.removeEventListener("dragenter", this._doReturnTrue);

            //touch events -- THIS WAY DOES NOT WORK, finish implementing pointerevents, than clean the touchevents
            /*this.canvas.removeEventListener("touchstart", this._touch_callback );
            this.canvas.removeEventListener("touchmove", this._touch_callback );
            this.canvas.removeEventListener("touchend", this._touch_callback );
            this.canvas.removeEventListener("touchcancel", this._touch_callback );*/
            this._mousedown_callback = null;
            this._mousewheel_callback = null;
            this._key_callback = null;
            this._ondrop_callback = null;

            this._events_binded = false;
        }
        /**
             * this function allows to render the canvas using WebGL instead of Canvas2D
             * this is useful if you plant to render 3D objects inside your nodes, it uses litegl.js for webgl and canvas2DtoWebGL to emulate the Canvas2D calls in webGL
             * @method enableWebGL
             **/
        enableWebGL() {
            if (typeof GL === "undefined") {
                throw "litegl.js must be included to use a WebGL canvas";
            }
            if (typeof enableWebGLCanvas === "undefined") {
                throw "webglCanvas.js must be included to use this feature";
            }

            this.gl = this.ctx = enableWebGLCanvas(this.canvas);
            this.ctx.webgl = true;
            this.bgcanvas = this.canvas;
            this.bgctx = this.gl;
            this.canvas.webgl_enabled = true;

            /*
        GL.create({ canvas: this.bgcanvas });
        this.bgctx = enableWebGLCanvas( this.bgcanvas );
        window.gl = this.gl;
        */
        }
        /**
             * marks as dirty the canvas, this way it will be rendered again
             *
             * @class LGraphCanvas
             * @method setDirty
             * @param {bool} fgcanvas if the foreground canvas is dirty (the one containing the nodes)
             * @param {bool} bgcanvas if the background canvas is dirty (the one containing the wires)
             */
        setDirty(fgcanvas, bgcanvas) {
            if (fgcanvas) {
                this.dirty_canvas = true;
            }
            if (bgcanvas) {
                this.dirty_bgcanvas = true;
            }
        }
        /**
             * Used to attach the canvas in a popup
             *
             * @method getCanvasWindow
             * @return {window} returns the window where the canvas is attached (the DOM root node)
             */
        getCanvasWindow() {
            if (!this.canvas) {
                return window;
            }
            var doc = this.canvas.ownerDocument;
            return doc.defaultView || doc.parentWindow;
        }
        /**
             * starts rendering the content of the canvas when needed
             *
             * @method startRendering
             */
        startRendering() {
            if (this.is_rendering) {
                return;
            } //already rendering

            this.is_rendering = true;
            renderFrame.call(this);

            function renderFrame() {
                if (!this.pause_rendering) {
                    this.draw();
                }

                var window = this.getCanvasWindow();
                if (this.is_rendering) {
                    window.requestAnimationFrame(renderFrame.bind(this));
                }
            }
        }
        /**
             * stops rendering the content of the canvas (to save resources)
             *
             * @method stopRendering
             */
        stopRendering() {
            this.is_rendering = false;
            /*
        if(this.rendering_timer_id)
        {
            clearInterval(this.rendering_timer_id);
            this.rendering_timer_id = null;
        }
        */
        }
        /* LiteGraphCanvas input */
        //used to block future mouse events (because of im gui)
        blockClick() {
            this.block_click = true;
            this.last_mouseclick = 0;
        }
        processMouseDown(e) {

            if (this.set_canvas_dirty_on_mouse_event)
                this.dirty_canvas = true;

            if (!this.graph) {
                return;
            }

            this.adjustMouseEvent(e);

            var ref_window = this.getCanvasWindow();
            var document = ref_window.document;
            LGraphCanvas.active_canvas = this;
            var that = this;

            var x = e.clientX;
            var y = e.clientY;
            //console.log(y,this.viewport);
            //console.log("pointerevents: processMouseDown pointerId:"+e.pointerId+" which:"+e.which+" isPrimary:"+e.isPrimary+" :: x y "+x+" "+y);
            this.ds.viewport = this.viewport;
            var is_inside = !this.viewport || (this.viewport && x >= this.viewport[0] && x < (this.viewport[0] + this.viewport[2]) && y >= this.viewport[1] && y < (this.viewport[1] + this.viewport[3]));

            //move mouse move event to the window in case it drags outside of the canvas
            if (!this.options.skip_events) {
                LiteGraph.pointerListenerRemove(this.canvas, "move", this._mousemove_callback);
                LiteGraph.pointerListenerAdd(ref_window.document, "move", this._mousemove_callback, true); //catch for the entire window
                LiteGraph.pointerListenerAdd(ref_window.document, "up", this._mouseup_callback, true);
            }

            if (!is_inside) {
                return;
            }

            var node = this.graph.getNodeOnPos(e.canvasX, e.canvasY, this.visible_nodes, 5);
            var skip_dragging = false;
            var skip_action = false;
            var now = LiteGraph.getTime();
            var is_primary = (e.isPrimary === undefined || !e.isPrimary);
            var is_double_click = (now - this.last_mouseclick < 300);
            this.mouse[0] = e.clientX;
            this.mouse[1] = e.clientY;
            this.graph_mouse[0] = e.canvasX;
            this.graph_mouse[1] = e.canvasY;
            this.last_click_position = [this.mouse[0], this.mouse[1]];

            if (this.pointer_is_down && is_primary) {
                this.pointer_is_double = true;
                //console.log("pointerevents: pointer_is_double start");
            } else {
                this.pointer_is_double = false;
            }
            this.pointer_is_down = true;


            this.canvas.focus();

            LiteGraph.closeAllContextMenus(ref_window);

            if (this.onMouse) {
                if (this.onMouse(e) == true)
                    return;
            }

            //left button mouse / single finger
            if (e.which == 1 && !this.pointer_is_double) {
                if (e.ctrlKey && !e.altKey) {
                    this.dragging_rectangle = new Float32Array(4);
                    this.dragging_rectangle[0] = e.canvasX;
                    this.dragging_rectangle[1] = e.canvasY;
                    this.dragging_rectangle[2] = 1;
                    this.dragging_rectangle[3] = 1;
                    skip_action = true;
                }

                // clone node ALT dragging
                if (LiteGraph.alt_drag_do_clone_nodes && e.altKey && !e.ctrlKey && node && this.allow_interaction && !skip_action && !this.read_only) {
                    const cloned = node.clone();
                    if (cloned) {
                        cloned.pos[0] += 5;
                        cloned.pos[1] += 5;
                        this.graph.add(cloned, false, { doCalcSize: false });
                        node = cloned;
                        skip_action = true;
                        if (!block_drag_node) {
                            if (this.allow_dragnodes) {
                                this.graph.beforeChange();
                                this.node_dragged = node;
                            }
                            if (!this.selected_nodes[node.id]) {
                                this.processNodeSelected(node, e);
                            }
                        }
                    }
                }

                var clicking_canvas_bg = false;

                //when clicked on top of a node
                //and it is not interactive
                if (node && (this.allow_interaction || node.flags.allow_interaction) && !skip_action && !this.read_only) {
                    if (!this.live_mode && !node.flags.pinned) {
                        this.bringToFront(node);
                    } //if it wasn't selected?


                    //not dragging mouse to connect two slots
                    if (this.allow_interaction && !this.connecting_links && !node.flags.collapsed && !this.live_mode) {
                        //Search for corner for resize
                        if (!skip_action &&
                            node.resizable !== false && node.inResizeCorner(e.canvasX, e.canvasY)) {
                            this.graph.beforeChange();
                            this.resizing_node = node;
                            this.canvas.style.cursor = "se-resize";
                            skip_action = true;
                        } else {
                            //search for outputs
                            if (node.outputs) {
                                for (var i = 0, l = node.outputs.length; i < l; ++i) {
                                    var output = node.outputs[i];
                                    var link_pos = node.getConnectionPos(false, i);
                                    if (isInsideRectangle(
                                        e.canvasX,
                                        e.canvasY,
                                        link_pos[0] - 15,
                                        link_pos[1] - 10,
                                        30,
                                        20
                                    )) {
                                        // Drag multiple output links
                                        if (e.shiftKey) {
                                            if (output.links?.length > 0) {

                                                this.connecting_links = [];
                                                for (const linkId of output.links) {
                                                    const link = this.graph.links[linkId];
                                                    const slot = link.target_slot;
                                                    const linked_node = this.graph._nodes_by_id[link.target_id];
                                                    const input = linked_node.inputs[slot];
                                                    const pos = linked_node.getConnectionPos(true, slot);

                                                    this.connecting_links.push({
                                                        node: linked_node,
                                                        slot: slot,
                                                        input: input,
                                                        output: null,
                                                        pos: pos,
                                                    });
                                                }

                                                skip_action = true;
                                                break;
                                            }
                                        }

                                        output.slot_index = i;
                                        this.connecting_links = [
                                            {
                                                node: node,
                                                slot: i,
                                                input: null,
                                                output: output,
                                                pos: link_pos,
                                            }
                                        ];

                                        if (LiteGraph.shift_click_do_break_link_from) {
                                            if (e.shiftKey) {
                                                node.disconnectOutput(i);
                                            }
                                        } else if (LiteGraph.ctrl_alt_click_do_break_link) {
                                            if (e.ctrlKey && e.altKey && !e.shiftKey) {
                                                node.disconnectOutput(i);
                                            }
                                        }

                                        if (is_double_click) {
                                            if (node.onOutputDblClick) {
                                                node.onOutputDblClick(i, e);
                                            }
                                        } else {
                                            if (node.onOutputClick) {
                                                node.onOutputClick(i, e);
                                            }
                                        }

                                        skip_action = true;
                                        break;
                                    }
                                }
                            }

                            //search for inputs
                            if (node.inputs) {
                                for (var i = 0, l = node.inputs.length; i < l; ++i) {
                                    var input = node.inputs[i];
                                    var link_pos = node.getConnectionPos(true, i);
                                    if (isInsideRectangle(
                                        e.canvasX,
                                        e.canvasY,
                                        link_pos[0] - 15,
                                        link_pos[1] - 10,
                                        30,
                                        20
                                    )) {
                                        if (is_double_click) {
                                            if (node.onInputDblClick) {
                                                node.onInputDblClick(i, e);
                                            }
                                        } else {
                                            if (node.onInputClick) {
                                                node.onInputClick(i, e);
                                            }
                                        }

                                        if (input.link !== null) {
                                            var link_info = this.graph.links[input.link]; //before disconnecting
                                            if (LiteGraph.click_do_break_link_to || (LiteGraph.ctrl_alt_click_do_break_link && e.ctrlKey && e.altKey && !e.shiftKey)) {
                                                node.disconnectInput(i);
                                            } else if (this.allow_reconnect_links ||
                                                //this.move_destination_link_without_shift ||
                                                e.shiftKey) {
                                                if (!LiteGraph.click_do_break_link_to) {
                                                    node.disconnectInput(i);
                                                }
                                                const linked_node = this.graph._nodes_by_id[link_info.origin_id];
                                                const slot = link_info.origin_slot;
                                                this.connecting_links = [
                                                    {
                                                        node: linked_node,
                                                        slot: slot,
                                                        input: null,
                                                        output: linked_node.outputs[slot],
                                                        pos: linked_node.getConnectionPos(false, slot),
                                                    }
                                                ];

                                                this.dirty_bgcanvas = true;
                                                skip_action = true;
                                            } else {
                                                // do same action as has not node ?
                                            }


                                        } else {
                                            // has not node
                                        }

                                        if (!skip_action) {
                                            // connect from in to out, from to to from
                                            this.connecting_links = [
                                                {
                                                    node: node,
                                                    slot: i,
                                                    input: input,
                                                    output: null,
                                                    pos: link_pos,
                                                }
                                            ];

                                            this.dirty_bgcanvas = true;
                                            skip_action = true;
                                        }

                                        break;
                                    }
                                }
                            }
                        } //not resizing
                    }

                    //it wasn't clicked on the links boxes
                    if (!skip_action) {
                        var block_drag_node = false;
                        if (node?.pinned) {
                            block_drag_node = true;
                        }
                        var pos = [e.canvasX - node.pos[0], e.canvasY - node.pos[1]];

                        //widgets
                        var widget = this.processNodeWidgets(node, this.graph_mouse, e);
                        if (widget) {
                            block_drag_node = true;
                            this.node_widget = [node, widget];
                        }

                        //double clicking
                        if (this.allow_interaction && is_double_click && this.selected_nodes[node.id]) {
                            // Check if it's a double click on the title bar
                            // Note: pos[1] is the y-coordinate of the node's body
                            // If clicking on node header (title), pos[1] is negative
                            if (pos[1] < 0) {
                                if (node.onNodeTitleDblClick) {
                                    node.onNodeTitleDblClick(e, pos, this);
                                }
                            }
                            //double click node
                            if (node.onDblClick) {
                                node.onDblClick(e, pos, this);
                            }
                            this.processNodeDblClicked(node);
                            block_drag_node = true;
                        }

                        //if do not capture mouse
                        if (node.onMouseDown && node.onMouseDown(e, pos, this)) {
                            block_drag_node = true;
                        } else {
                            //open subgraph button
                            if (node.subgraph && !node.skip_subgraph_button) {
                                if (!node.flags.collapsed && pos[0] > node.size[0] - LiteGraph.NODE_TITLE_HEIGHT && pos[1] < 0) {
                                    var that = this;
                                    setTimeout(function () {
                                        that.openSubgraph(node.subgraph);
                                    }, 10);
                                }
                            }

                            if (this.live_mode) {
                                clicking_canvas_bg = true;
                                block_drag_node = true;
                            }
                        }

                        if (!block_drag_node) {
                            if (this.allow_dragnodes) {
                                this.graph.beforeChange();
                                this.node_dragged = node;
                            }
                            // Account for shift + click + drag
                            if (!(e.shiftKey && !e.ctrlKey && !e.altKey) || !node.is_selected) {
                                this.processNodeSelected(node, e);
                            }
                        } else { // double-click
                            /**
                             * Don't call the function if the block is already selected.
                             * Otherwise, it could cause the block to be unselected while its panel is open.
                             */
                            if (!node.is_selected) this.processNodeSelected(node, e);
                        }

                        this.dirty_canvas = true;
                    }
                } //clicked outside of nodes
                else {
                    if (!skip_action) {
                        //search for link connector
                        if (!this.read_only)
                        {
                            // Set the width of the line for isPointInStroke checks
                            const lineWidth = this.ctx.lineWidth;
                            this.ctx.lineWidth = this.connections_width + 7;
                            for (var i = 0; i < this.visible_links.length; ++i) {
                                var link = this.visible_links[i];
                                var center = link._pos;
                                let overLink = null;
                                if (!center ||
                                    e.canvasX < center[0] - 4 ||
                                    e.canvasX > center[0] + 4 ||
                                    e.canvasY < center[1] - 4 ||
                                    e.canvasY > center[1] + 4) {
                                    // If we shift click on a link then start a link from that input
                                    if (e.shiftKey && link.path && this.ctx.isPointInStroke(link.path, e.canvasX, e.canvasY)) {
                                        overLink = link;
                                    } else {
                                        continue;
                                    }
                                }
                                if (overLink) {
                                    const slot = overLink.origin_slot;
                                    const originNode = this.graph._nodes_by_id[overLink.origin_id];
    
                                    this.connecting_links ??= []
                                    this.connecting_links.push({
                                        node: originNode,
                                        slot,
                                        output: originNode.outputs[slot],
                                        pos: originNode.getConnectionPos(false, slot),
                                    });
                                    skip_action = true;
                                } else {
                                    //link clicked
                                    this.showLinkMenu(link, e);
                                    this.over_link_center = null; //clear tooltip
                                }
                                break;
                            }

                            // Restore line width
                            this.ctx.lineWidth = lineWidth;
                        }

                        this.selected_group = this.graph.getGroupOnPos(e.canvasX, e.canvasY);
                        this.selected_group_resizing = false;
                        if (this.selected_group && !this.read_only) {
                            if (e.ctrlKey) {
                                this.dragging_rectangle = null;
                            }

                            var dist = distance([e.canvasX, e.canvasY], [this.selected_group.pos[0] + this.selected_group.size[0], this.selected_group.pos[1] + this.selected_group.size[1]]);
                            if (dist * this.ds.scale < 10) {
                                this.selected_group_resizing = true;
                            } else {
                                this.selected_group.recomputeInsideNodes();
                            }

                            if (is_double_click) {
                                this.canvas.dispatchEvent(new CustomEvent(
                                    "litegraph:canvas",
                                    {
                                        bubbles: true,
                                        detail: {
                                            subType: "group-double-click",
                                            originalEvent: e,
                                            group: this.selected_group,
                                        }
                                    }
                                ));
                            }
                        } else if (is_double_click && !this.read_only) {
                            // Double click within group should not trigger the searchbox.
                            if (this.allow_searchbox) {
                                this.showSearchBox(e);
                                e.preventDefault();
                                e.stopPropagation();
                            }
                            this.canvas.dispatchEvent(new CustomEvent(
                                "litegraph:canvas",
                                {
                                    bubbles: true,
                                    detail: {
                                        subType: "empty-double-click",
                                        originalEvent: e,
                                    }
                                }
                            ));
                        }

                        clicking_canvas_bg = true;
                    }
                }

                if (!skip_action && clicking_canvas_bg && this.allow_dragcanvas) {
                    //console.log("pointerevents: dragging_canvas start");
                    this.dragging_canvas = true;
                }

            } else if (e.which == 2) {
                //middle button
                if (LiteGraph.middle_click_slot_add_default_node) {
                    if (node && this.allow_interaction && !skip_action && !this.read_only) {
                        //not dragging mouse to connect two slots
                        if (!this.connecting_links &&
                            !node.flags.collapsed &&
                            !this.live_mode) {
                            var mClikSlot = false;
                            var mClikSlot_index = false;
                            var mClikSlot_isOut = false;
                            //search for outputs
                            if (node.outputs) {
                                for (var i = 0, l = node.outputs.length; i < l; ++i) {
                                    var output = node.outputs[i];
                                    var link_pos = node.getConnectionPos(false, i);
                                    if (isInsideRectangle(e.canvasX, e.canvasY, link_pos[0] - 15, link_pos[1] - 10, 30, 20)) {
                                        mClikSlot = output;
                                        mClikSlot_index = i;
                                        mClikSlot_isOut = true;
                                        break;
                                    }
                                }
                            }

                            //search for inputs
                            if (node.inputs) {
                                for (var i = 0, l = node.inputs.length; i < l; ++i) {
                                    var input = node.inputs[i];
                                    var link_pos = node.getConnectionPos(true, i);
                                    if (isInsideRectangle(e.canvasX, e.canvasY, link_pos[0] - 15, link_pos[1] - 10, 30, 20)) {
                                        mClikSlot = input;
                                        mClikSlot_index = i;
                                        mClikSlot_isOut = false;
                                        break;
                                    }
                                }
                            }
                            //console.log("middleClickSlots? "+mClikSlot+" & "+(mClikSlot_index!==false));
                            if (mClikSlot && mClikSlot_index !== false) {

                                var alphaPosY = 0.5 - ((mClikSlot_index + 1) / ((mClikSlot_isOut ? node.outputs.length : node.inputs.length)));
                                var node_bounding = node.getBounding();
                                // estimate a position: this is a bad semi-bad-working mess .. REFACTOR with a correct autoplacement that knows about the others slots and nodes
                                var posRef = [(!mClikSlot_isOut ? node_bounding[0] : node_bounding[0] + node_bounding[2]) // + node_bounding[0]/this.canvas.width*150
                                    ,
                                e.canvasY - 80 // + node_bounding[0]/this.canvas.width*66 // vertical "derive"
                                ];
                                var nodeCreated = this.createDefaultNodeForSlot({
                                    nodeFrom: !mClikSlot_isOut ? null : node,
                                    slotFrom: !mClikSlot_isOut ? null : mClikSlot_index,
                                    nodeTo: !mClikSlot_isOut ? node : null,
                                    slotTo: !mClikSlot_isOut ? mClikSlot_index : null,
                                    position: posRef //,e: e
                                    ,
                                    nodeType: "AUTO" //nodeNewType
                                    ,
                                    posAdd: [!mClikSlot_isOut ? -30 : 30, -alphaPosY * 130] //-alphaPosY*30]
                                    ,
                                    posSizeFix: [!mClikSlot_isOut ? -1 : 0, 0] //-alphaPosY*2*/
                                });
                                skip_action = true;
                            }
                        }
                    }
                }

                if (!skip_action && this.allow_dragcanvas) {
                    //console.log("pointerevents: dragging_canvas start from middle button");
                    this.dragging_canvas = true;
                }


            } else if (e.which == 3 || this.pointer_is_double) {

                //right button
                if (this.allow_interaction && !skip_action && !this.read_only) {

                    // is it hover a node ?
                    if (node) {
                        if (Object.keys(this.selected_nodes).length
                            && (this.selected_nodes[node.id] || e.shiftKey || e.ctrlKey || e.metaKey)) {
                            // is multiselected or using shift to include the now node
                            if (!this.selected_nodes[node.id]) this.selectNodes([node], true); // add this if not present
                        } else {
                            // update selection
                            this.selectNodes([node]);
                        }
                    }

                    // show menu on this node
                    this.processContextMenu(node, e);
                }

            }

            //TODO
            //if(this.node_selected != prev_selected)
            //	this.onNodeSelectionChange(this.node_selected);
            this.last_mouse[0] = e.clientX;
            this.last_mouse[1] = e.clientY;
            this.last_mouseclick = LiteGraph.getTime();
            this.last_mouse_dragging = true;

            /*
        if( (this.dirty_canvas || this.dirty_bgcanvas) && this.rendering_timer_id == null)
            this.draw();
        */
            this.graph.change();

            //this is to ensure to defocus(blur) if a text input element is on focus
            if (!ref_window.document.activeElement ||
                (ref_window.document.activeElement.nodeName.toLowerCase() !=
                    "input" &&
                    ref_window.document.activeElement.nodeName.toLowerCase() !=
                    "textarea")) {
                e.preventDefault();
            }
            e.stopPropagation();

            if (this.onMouseDown) {
                this.onMouseDown(e);
            }

            return false;
        }
        /**
             * Called when a mouse move event has to be processed
             * @method processMouseMove
             **/
        processMouseMove(e) {
            if (this.autoresize) {
                this.resize();
            }

            if (this.set_canvas_dirty_on_mouse_event)
                this.dirty_canvas = true;

            if (!this.graph) {
                return;
            }

            LGraphCanvas.active_canvas = this;
            this.adjustMouseEvent(e);
            var mouse = [e.clientX, e.clientY];
            this.mouse[0] = mouse[0];
            this.mouse[1] = mouse[1];
            var delta = [
                mouse[0] - this.last_mouse[0],
                mouse[1] - this.last_mouse[1]
            ];
            this.last_mouse = mouse;
            this.graph_mouse[0] = e.canvasX;
            this.graph_mouse[1] = e.canvasY;

            //console.log("pointerevents: processMouseMove "+e.pointerId+" "+e.isPrimary);
            if (this.block_click) {
                //console.log("pointerevents: processMouseMove block_click");
                e.preventDefault();
                return false;
            }

            e.dragging = this.last_mouse_dragging;

            if (this.node_widget) {
                this.processNodeWidgets(
                    this.node_widget[0],
                    this.graph_mouse,
                    e,
                    this.node_widget[1]
                );
                this.dirty_canvas = true;
            }

            //get node over
            var node = this.graph.getNodeOnPos(e.canvasX, e.canvasY, this.visible_nodes);

            if (this.dragging_rectangle) {
                this.dragging_rectangle[2] = e.canvasX - this.dragging_rectangle[0];
                this.dragging_rectangle[3] = e.canvasY - this.dragging_rectangle[1];
                this.dirty_canvas = true;
            }
            else if (this.selected_group && !this.read_only) {
                //moving/resizing a group
                if (this.selected_group_resizing) {
                    this.selected_group.resize(
                        e.canvasX - this.selected_group.pos[0],
                        e.canvasY - this.selected_group.pos[1]
                    );
                } else {
                    var deltax = delta[0] / this.ds.scale;
                    var deltay = delta[1] / this.ds.scale;
                    this.selected_group.move(deltax, deltay, e.ctrlKey);
                    if (this.selected_group._nodes.length) {
                        this.dirty_canvas = true;
                    }
                }
                this.dirty_bgcanvas = true;
            } else if (this.dragging_canvas) {
                ////console.log("pointerevents: processMouseMove is dragging_canvas");
                this.ds.offset[0] += delta[0] / this.ds.scale;
                this.ds.offset[1] += delta[1] / this.ds.scale;
                this.dirty_canvas = true;
                this.dirty_bgcanvas = true;
            } else if ((this.allow_interaction || (node && node.flags.allow_interaction)) && !this.read_only) {
                if (this.connecting_links) {
                    this.dirty_canvas = true;
                }

                //remove mouseover flag
                for (var i = 0, l = this.graph._nodes.length; i < l; ++i) {
                    if (this.graph._nodes[i].mouseOver && node != this.graph._nodes[i]) {
                        //mouse leave
                        this.graph._nodes[i].mouseOver = false;
                        if (this.node_over && this.node_over.onMouseLeave) {
                            this.node_over.onMouseLeave(e);
                        }
                        this.node_over = null;
                        this.dirty_canvas = true;
                    }
                }

                //mouse over a node
                if (node) {

                    if (node.redraw_on_mouse)
                        this.dirty_canvas = true;

                    //this.canvas.style.cursor = "move";
                    if (!node.mouseOver) {
                        //mouse enter
                        node.mouseOver = true;
                        this.node_over = node;
                        this.dirty_canvas = true;

                        if (node.onMouseEnter) {
                            node.onMouseEnter(e);
                        }
                    }

                    //in case the node wants to do something
                    if (node.onMouseMove) {
                        node.onMouseMove(e, [e.canvasX - node.pos[0], e.canvasY - node.pos[1]], this);
                    }

                    //if dragging a link
                    if (this.connecting_links) {
                        const firstLink = this.connecting_links[0];

                        if (firstLink.output) {

                            var pos = this._highlight_input || [0, 0]; //to store the output of isOverNodeInput


                            //on top of input
                            if (this.isOverNodeBox(node, e.canvasX, e.canvasY)) {
                                //mouse on top of the corner box, don't know what to do
                            } else {
                                //check if I have a slot below de mouse
                                var slot = this.isOverNodeInput(node, e.canvasX, e.canvasY, pos);
                                if (slot != -1 && node.inputs[slot] && LiteGraph.isValidConnection(firstLink.output.type, node.inputs[slot].type)) {
                                    this._highlight_input = pos;
                                    this._highlight_input_slot = node.inputs[slot]; // XXX CHECK THIS
                                } else {
                                    this._highlight_input = null;
                                    this._highlight_input_slot = null; // XXX CHECK THIS
                                }
                            }

                        } else if (firstLink.input) {

                            var pos = this._highlight_output || [0, 0]; //to store the output of isOverNodeOutput


                            //on top of output
                            if (this.isOverNodeBox(node, e.canvasX, e.canvasY)) {
                                //mouse on top of the corner box, don't know what to do
                            } else {
                                //check if I have a slot below de mouse
                                var slot = this.isOverNodeOutput(node, e.canvasX, e.canvasY, pos);
                                if (slot != -1 && node.outputs[slot] && LiteGraph.isValidConnection(firstLink.input.type, node.outputs[slot].type)) {
                                    this._highlight_output = pos;
                                } else {
                                    this._highlight_output = null;
                                }
                            }
                        }
                    }

                    //Search for corner
                    if (this.canvas) {
                        if (node.inResizeCorner(e.canvasX, e.canvasY)) {
                            this.canvas.style.cursor = "se-resize";
                        } else {
                            this.canvas.style.cursor = "crosshair";
                        }
                    }
                } else { //not over a node
                    //search for link connector
                    var over_link = null;
                    for (var i = 0; i < this.visible_links.length; ++i) {
                        var link = this.visible_links[i];
                        var center = link._pos;
                        if (!center ||
                            e.canvasX < center[0] - 4 ||
                            e.canvasX > center[0] + 4 ||
                            e.canvasY < center[1] - 4 ||
                            e.canvasY > center[1] + 4) {
                            continue;
                        }
                        over_link = link;
                        break;
                    }
                    if (over_link != this.over_link_center) {
                        this.over_link_center = over_link;
                        this.dirty_canvas = true;
                    }

                    if (this.canvas) {
                        this.canvas.style.cursor = "";
                    }
                } //end


                //send event to node if capturing input (used with widgets that allow drag outside of the area of the node)
                if (this.node_capturing_input && this.node_capturing_input != node && this.node_capturing_input.onMouseMove) {
                    this.node_capturing_input.onMouseMove(e, [e.canvasX - this.node_capturing_input.pos[0], e.canvasY - this.node_capturing_input.pos[1]], this);
                }

                //node being dragged
                if (this.node_dragged && !this.live_mode) {
                    //console.log("draggin!",this.selected_nodes);
                    for (var i in this.selected_nodes) {
                        var n = this.selected_nodes[i];
                        n.pos[0] += delta[0] / this.ds.scale;
                        n.pos[1] += delta[1] / this.ds.scale;
                        if (!n.is_selected) this.processNodeSelected(n, e); /*
                     * Don't call the function if the block is already selected.
                     * Otherwise, it could cause the block to be unselected while dragging.
                     */



                    }

                    this.dirty_canvas = true;
                    this.dirty_bgcanvas = true;
                }

                if (this.resizing_node && !this.live_mode) {
                    //convert mouse to node space
                    var desired_size = [e.canvasX - this.resizing_node.pos[0], e.canvasY - this.resizing_node.pos[1]];
                    var min_size = this.resizing_node.computeSize();
                    desired_size[0] = Math.max(min_size[0], desired_size[0]);
                    desired_size[1] = Math.max(min_size[1], desired_size[1]);
                    this.resizing_node.setSize(desired_size);

                    this.canvas.style.cursor = "se-resize";
                    this.dirty_canvas = true;
                    this.dirty_bgcanvas = true;
                }
            }

            e.preventDefault();
            return false;
        }
        /**
             * Called when a mouse up event has to be processed
             * @method processMouseUp
             **/
        processMouseUp(e) {

            var is_primary = (e.isPrimary === undefined || e.isPrimary);

            //early exit for extra pointer
            if (!is_primary) {
                /*e.stopPropagation();
                e.preventDefault();*/
                //console.log("pointerevents: processMouseUp pointerN_stop "+e.pointerId+" "+e.isPrimary);
                return false;
            }

            //console.log("pointerevents: processMouseUp "+e.pointerId+" "+e.isPrimary+" :: "+e.clientX+" "+e.clientY);
            if (!this.graph)
                return;

            var window = this.getCanvasWindow();
            var document = window.document;
            LGraphCanvas.active_canvas = this;

            //restore the mousemove event back to the canvas
            if (!this.options.skip_events) {
                //console.log("pointerevents: processMouseUp adjustEventListener");
                LiteGraph.pointerListenerRemove(document, "move", this._mousemove_callback, true);
                LiteGraph.pointerListenerAdd(this.canvas, "move", this._mousemove_callback, true);
                LiteGraph.pointerListenerRemove(document, "up", this._mouseup_callback, true);
            }

            this.adjustMouseEvent(e);
            var now = LiteGraph.getTime();
            e.click_time = now - this.last_mouseclick;
            this.last_mouse_dragging = false;
            this.last_click_position = null;

            if (this.block_click) {
                //console.log("pointerevents: processMouseUp block_clicks");
                this.block_click = false; //used to avoid sending twice a click in a immediate button
            }

            //console.log("pointerevents: processMouseUp which: "+e.which);
            if (e.which == 1) {

                if (this.node_widget) {
                    this.processNodeWidgets(this.node_widget[0], this.graph_mouse, e);
                }

                //left button
                this.node_widget = null;

                if (this.selected_group) {
                    var diffx = this.selected_group.pos[0] -
                        Math.round(this.selected_group.pos[0]);
                    var diffy = this.selected_group.pos[1] -
                        Math.round(this.selected_group.pos[1]);
                    this.selected_group.move(diffx, diffy, e.ctrlKey);
                    this.selected_group.pos[0] = Math.round(
                        this.selected_group.pos[0]
                    );
                    this.selected_group.pos[1] = Math.round(
                        this.selected_group.pos[1]
                    );
                    if (this.selected_group._nodes.length) {
                        this.dirty_canvas = true;
                    }
                    this.selected_group = null;
                }
                this.selected_group_resizing = false;

                var node = this.graph.getNodeOnPos(
                    e.canvasX,
                    e.canvasY,
                    this.visible_nodes
                );

                if (this.dragging_rectangle) {
                    if (this.graph) {
                        var nodes = this.graph._nodes;
                        var node_bounding = new Float32Array(4);

                        //compute bounding and flip if left to right
                        var w = Math.abs(this.dragging_rectangle[2]);
                        var h = Math.abs(this.dragging_rectangle[3]);
                        var startx = this.dragging_rectangle[2] < 0
                            ? this.dragging_rectangle[0] - w
                            : this.dragging_rectangle[0];
                        var starty = this.dragging_rectangle[3] < 0
                            ? this.dragging_rectangle[1] - h
                            : this.dragging_rectangle[1];
                        this.dragging_rectangle[0] = startx;
                        this.dragging_rectangle[1] = starty;
                        this.dragging_rectangle[2] = w;
                        this.dragging_rectangle[3] = h;

                        // test dragging rect size, if minimun simulate a click
                        if (!node || (w > 10 && h > 10)) {
                            //test against all nodes (not visible because the rectangle maybe start outside
                            var to_select = [];
                            for (var i = 0; i < nodes.length; ++i) {
                                var nodeX = nodes[i];
                                nodeX.getBounding(node_bounding);
                                if (!overlapBounding(
                                    this.dragging_rectangle,
                                    node_bounding
                                )) {
                                    continue;
                                } //out of the visible area
                                to_select.push(nodeX);
                            }
                            if (to_select.length) {
                                this.selectNodes(to_select, e.shiftKey); // add to selection with shift
                            }
                        } else {
                            // will select of update selection
                            this.selectNodes([node], e.shiftKey || e.ctrlKey); // add to selection add to selection with ctrlKey or shiftKey
                        }

                    }
                    this.dragging_rectangle = null;
                } else if (this.connecting_links) {

                    //node below mouse
                    if (node) {
                        for (const link of this.connecting_links) {

                            //dragging a connection
                            this.dirty_canvas = true;
                            this.dirty_bgcanvas = true;

                            /* no need to condition on event type.. just another type
                            if (
                                connType == LiteGraph.EVENT &&
                                this.isOverNodeBox(node, e.canvasX, e.canvasY)
                            ) {
                                
                                this.connecting_node.connect(
                                    this.connecting_slot,
                                    node,
                                    LiteGraph.EVENT
                                );
                                
                            } else {*/
                            //slot below mouse? connect
                            if (link.output) {

                                var slot = this.isOverNodeInput(
                                    node,
                                    e.canvasX,
                                    e.canvasY
                                );
                                if (slot != -1) {
                                    link.node.connect(link.slot, node, slot);
                                } else {
                                    //not on top of an input
                                    // look for a good slot
                                    link.node.connectByType(link.slot, node, link.output.type);
                                }
                            } else if (link.input) {
                                var slot = this.isOverNodeOutput(
                                    node,
                                    e.canvasX,
                                    e.canvasY
                                );

                                if (slot != -1) {
                                    node.connect(slot, link.node, link.slot); // this is inverted has output-input nature like
                                } else {
                                    //not on top of an input
                                    // look for a good slot
                                    link.node.connectByTypeOutput(link.slot, node, link.input.type);
                                }
                            }
                        }
                    } else {
                        const firstLink = this.connecting_links[0];
                        const linkReleaseContext = firstLink.output ? {
                            node_from: firstLink.node,
                            slot_from: firstLink.output,
                            type_filter_in: firstLink.output.type
                        } : {
                            node_to: firstLink.node,
                            slot_from: firstLink.input,
                            type_filter_out: firstLink.input.type
                        };
                        // For external event only.
                        const linkReleaseContextExtended = {
                            links: this.connecting_links,
                        };
                        this.canvas.dispatchEvent(new CustomEvent(
                            "litegraph:canvas", {
                                bubbles: true,
                                detail: {
                                    subType: "empty-release",
                                    originalEvent: e,
                                    linkReleaseContext: linkReleaseContextExtended,
                                },
                            }
                        ));
                        // add menu when releasing link in empty space
                        if (LiteGraph.release_link_on_empty_shows_menu) {
                            if (e.shiftKey) {
                                if (this.allow_searchbox) {
                                    this.showSearchBox(e, linkReleaseContext);
                                }
                            } else {
                                if (firstLink.output) {
                                    this.showConnectionMenu({ nodeFrom: firstLink.node, slotFrom: firstLink.output, e: e });
                                } else if (firstLink.input) {
                                    this.showConnectionMenu({ nodeTo: firstLink.node, slotTo: firstLink.input, e: e });
                                }
                            }
                        }
                    }

                    this.connecting_links = null;
                } //not dragging connection
                else if (this.resizing_node) {
                    this.dirty_canvas = true;
                    this.dirty_bgcanvas = true;
                    this.graph.afterChange(this.resizing_node);
                    this.resizing_node = null;
                } else if (this.node_dragged) {
                    //node being dragged?
                    var node = this.node_dragged;
                    if (node &&
                        e.click_time < 300 &&
                        isInsideRectangle(e.canvasX, e.canvasY, node.pos[0], node.pos[1] - LiteGraph.NODE_TITLE_HEIGHT, LiteGraph.NODE_TITLE_HEIGHT, LiteGraph.NODE_TITLE_HEIGHT)) {
                        node.collapse();
                    }

                    this.dirty_canvas = true;
                    this.dirty_bgcanvas = true;
                    this.node_dragged.pos[0] = Math.round(this.node_dragged.pos[0]);
                    this.node_dragged.pos[1] = Math.round(this.node_dragged.pos[1]);
                    if (this.graph.config.align_to_grid || this.align_to_grid) {
                        this.node_dragged.alignToGrid();
                    }
                    if (this.onNodeMoved)
                        this.onNodeMoved(this.node_dragged);
                    this.graph.afterChange(this.node_dragged);
                    this.node_dragged = null;
                } //no node being dragged
                else {
                    //get node over
                    var node = this.graph.getNodeOnPos(
                        e.canvasX,
                        e.canvasY,
                        this.visible_nodes
                    );

                    if (!node && e.click_time < 300) {
                        this.deselectAllNodes();
                    }

                    this.dirty_canvas = true;
                    this.dragging_canvas = false;

                    if (this.node_over && this.node_over.onMouseUp) {
                        this.node_over.onMouseUp(e, [e.canvasX - this.node_over.pos[0], e.canvasY - this.node_over.pos[1]], this);
                    }
                    if (this.node_capturing_input &&
                        this.node_capturing_input.onMouseUp) {
                        this.node_capturing_input.onMouseUp(e, [
                            e.canvasX - this.node_capturing_input.pos[0],
                            e.canvasY - this.node_capturing_input.pos[1]
                        ]);
                    }
                }
            } else if (e.which == 2) {
                //middle button
                //trace("middle");
                this.dirty_canvas = true;
                this.dragging_canvas = false;
            } else if (e.which == 3) {
                //right button
                //trace("right");
                this.dirty_canvas = true;
                this.dragging_canvas = false;
            }

            /*
            if((this.dirty_canvas || this.dirty_bgcanvas) && this.rendering_timer_id == null)
                this.draw();
            */
            if (is_primary) {
                this.pointer_is_down = false;
                this.pointer_is_double = false;
            }

            this.graph.change();

            //console.log("pointerevents: processMouseUp stopPropagation");
            e.stopPropagation();
            e.preventDefault();
            return false;
        }
        /**
             * Called when a mouse wheel event has to be processed
             * @method processMouseWheel
             **/
        processMouseWheel(e) {
            if (!this.graph || !this.allow_dragcanvas) {
                return;
            }

            var delta = e.wheelDeltaY != null ? e.wheelDeltaY : e.detail * -60;

            this.adjustMouseEvent(e);

            var x = e.clientX;
            var y = e.clientY;
            var is_inside = !this.viewport || (this.viewport && x >= this.viewport[0] && x < (this.viewport[0] + this.viewport[2]) && y >= this.viewport[1] && y < (this.viewport[1] + this.viewport[3]));
            if (!is_inside)
                return;

            var scale = this.ds.scale;

            if (delta > 0) {
                scale *= this.zoom_speed;
            } else if (delta < 0) {
                scale *= 1 / this.zoom_speed;
            }

            //this.setZoom( scale, [ e.clientX, e.clientY ] );
            this.ds.changeScale(scale, [e.clientX, e.clientY]);

            this.graph.change();

            e.preventDefault();
            return false; // prevent default
        }
        /**
             * returns true if a position (in graph space) is on top of a node little corner box
             * @method isOverNodeBox
             **/
        isOverNodeBox(node, canvasx, canvasy) {
            var title_height = LiteGraph.NODE_TITLE_HEIGHT;
            if (isInsideRectangle(
                canvasx,
                canvasy,
                node.pos[0] + 2,
                node.pos[1] + 2 - title_height,
                title_height - 4,
                title_height - 4
            )) {
                return true;
            }
            return false;
        }
        /**
             * returns the INDEX if a position (in graph space) is on top of a node input slot
             * @method isOverNodeInput
             **/
        isOverNodeInput(node,
            canvasx,
            canvasy,
            slot_pos) {
            if (node.inputs) {
                for (var i = 0, l = node.inputs.length; i < l; ++i) {
                    var input = node.inputs[i];
                    var link_pos = node.getConnectionPos(true, i);
                    var is_inside = false;
                    if (node.horizontal) {
                        is_inside = isInsideRectangle(
                            canvasx,
                            canvasy,
                            link_pos[0] - 5,
                            link_pos[1] - 10,
                            10,
                            20
                        );
                    } else {
                        // TODO: Find a cheap way to measure text, and do it on node label change instead of here
                        // Input icon width + text approximation
                        const width = 20 + (((input.label?.length ?? input.name?.length) || 3) * 7);
                        is_inside = isInsideRectangle(
                            canvasx,
                            canvasy,
                            link_pos[0] - 10,
                            link_pos[1] - 10,
                            width,
                            20
                        );
                    }
                    if (is_inside) {
                        if (slot_pos) {
                            slot_pos[0] = link_pos[0];
                            slot_pos[1] = link_pos[1];
                        }
                        return i;
                    }
                }
            }
            return -1;
        }
        /**
             * returns the INDEX if a position (in graph space) is on top of a node output slot
             * @method isOverNodeOuput
             **/
        isOverNodeOutput(node,
            canvasx,
            canvasy,
            slot_pos) {
            if (node.outputs) {
                for (var i = 0, l = node.outputs.length; i < l; ++i) {
                    var output = node.outputs[i];
                    var link_pos = node.getConnectionPos(false, i);
                    var is_inside = false;
                    if (node.horizontal) {
                        is_inside = isInsideRectangle(
                            canvasx,
                            canvasy,
                            link_pos[0] - 5,
                            link_pos[1] - 10,
                            10,
                            20
                        );
                    } else {
                        is_inside = isInsideRectangle(
                            canvasx,
                            canvasy,
                            link_pos[0] - 10,
                            link_pos[1] - 10,
                            40,
                            20
                        );
                    }
                    if (is_inside) {
                        if (slot_pos) {
                            slot_pos[0] = link_pos[0];
                            slot_pos[1] = link_pos[1];
                        }
                        return i;
                    }
                }
            }
            return -1;
        }
        /**
             * process a key event
             * @method processKey
             **/
        processKey(e) {
            if (!this.graph) {
                return;
            }

            var block_default = false;
            //console.log(e); //debug
            if (e.target.localName == "input") {
                return;
            }

            if (e.type == "keydown") {
                if (e.keyCode == 32) {
                    //space
                    this.dragging_canvas = true;
                    block_default = true;
                }

                if (e.keyCode == 27) {
                    //esc
                    if (this.node_panel) this.node_panel.close();
                    if (this.options_panel) this.options_panel.close();
                    block_default = true;
                }

                //select all Control A
                if (e.keyCode == 65 && e.ctrlKey) {
                    this.selectNodes();
                    block_default = true;
                }

                if ((e.keyCode === 67) && (e.metaKey || e.ctrlKey) && !e.shiftKey) {
                    //copy
                    if (this.selected_nodes) {
                        this.copyToClipboard();
                        block_default = true;
                    }
                }

                if ((e.keyCode === 86) && (e.metaKey || e.ctrlKey)) {
                    //paste
                    this.pasteFromClipboard(e.shiftKey);
                }

                //delete or backspace
                if (e.keyCode == 46 || e.keyCode == 8) {
                    if (e.target.localName != "input" &&
                        e.target.localName != "textarea") {
                        this.deleteSelectedNodes();
                        block_default = true;
                    }
                }

                //collapse
                //...
                //TODO
                if (this.selected_nodes) {
                    for (var i in this.selected_nodes) {
                        if (this.selected_nodes[i].onKeyDown) {
                            this.selected_nodes[i].onKeyDown(e);
                        }
                    }
                }
            } else if (e.type == "keyup") {
                if (e.keyCode == 32) {
                    // space
                    this.dragging_canvas = false;
                }

                if (this.selected_nodes) {
                    for (var i in this.selected_nodes) {
                        if (this.selected_nodes[i].onKeyUp) {
                            this.selected_nodes[i].onKeyUp(e);
                        }
                    }
                }
            }

            this.graph.change();

            if (block_default) {
                e.preventDefault();
                e.stopImmediatePropagation();
                return false;
            }
        }
        copyToClipboard(nodes) {
            var clipboard_info = {
                nodes: [],
                links: []
            };
            var index = 0;
            var selected_nodes_array = [];
            if (!nodes) nodes = this.selected_nodes;
            for (var i in nodes) {
                var node = nodes[i];
                if (node.clonable === false)
                    continue;
                node._relative_id = index;
                selected_nodes_array.push(node);
                index += 1;
            }

            for (var i = 0; i < selected_nodes_array.length; ++i) {
                var node = selected_nodes_array[i];
                var cloned = node.clone();
                if (!cloned) {
                    console.warn("node type not found: " + node.type);
                    continue;
                }
                clipboard_info.nodes.push(cloned.serialize());
                if (node.inputs && node.inputs.length) {
                    for (var j = 0; j < node.inputs.length; ++j) {
                        var input = node.inputs[j];
                        if (!input || input.link == null) {
                            continue;
                        }
                        var link_info = this.graph.links[input.link];
                        if (!link_info) {
                            continue;
                        }
                        var target_node = this.graph.getNodeById(
                            link_info.origin_id
                        );
                        if (!target_node) {
                            continue;
                        }
                        clipboard_info.links.push([
                            target_node._relative_id,
                            link_info.origin_slot, //j,
                            node._relative_id,
                            link_info.target_slot,
                            target_node.id
                        ]);
                    }
                }
            }
            localStorage.setItem(
                "litegrapheditor_clipboard",
                JSON.stringify(clipboard_info)
            );
        }
        pasteFromClipboard(isConnectUnselected = false) {
            // if ctrl + shift + v is off, return when isConnectUnselected is true (shift is pressed) to maintain old behavior
            if (!LiteGraph.ctrl_shift_v_paste_connect_unselected_outputs && isConnectUnselected) {
                return;
            }
            var data = localStorage.getItem("litegrapheditor_clipboard");
            if (!data) {
                return;
            }

            this.graph.beforeChange();

            //create nodes
            var clipboard_info = JSON.parse(data);
            // calculate top-left node, could work without this processing but using diff with last node pos :: clipboard_info.nodes[clipboard_info.nodes.length-1].pos
            var posMin = false;
            var posMinIndexes = false;
            for (var i = 0; i < clipboard_info.nodes.length; ++i) {
                if (posMin) {
                    if (posMin[0] > clipboard_info.nodes[i].pos[0]) {
                        posMin[0] = clipboard_info.nodes[i].pos[0];
                        posMinIndexes[0] = i;
                    }
                    if (posMin[1] > clipboard_info.nodes[i].pos[1]) {
                        posMin[1] = clipboard_info.nodes[i].pos[1];
                        posMinIndexes[1] = i;
                    }
                }
                else {
                    posMin = [clipboard_info.nodes[i].pos[0], clipboard_info.nodes[i].pos[1]];
                    posMinIndexes = [i, i];
                }
            }
            var nodes = [];
            for (var i = 0; i < clipboard_info.nodes.length; ++i) {
                var node_data = clipboard_info.nodes[i];
                var node = LiteGraph.createNode(node_data.type);
                if (node) {
                    node.configure(node_data);

                    //paste in last known mouse position
                    node.pos[0] += this.graph_mouse[0] - posMin[0]; //+= 5;
                    node.pos[1] += this.graph_mouse[1] - posMin[1]; //+= 5;

                    this.graph.add(node, { doProcessChange: false });

                    nodes.push(node);
                }
            }

            //create links
            for (var i = 0; i < clipboard_info.links.length; ++i) {
                var link_info = clipboard_info.links[i];
                var origin_node = undefined;
                var origin_node_relative_id = link_info[0];
                if (origin_node_relative_id != null) {
                    origin_node = nodes[origin_node_relative_id];
                } else if (LiteGraph.ctrl_shift_v_paste_connect_unselected_outputs && isConnectUnselected) {
                    var origin_node_id = link_info[4];
                    if (origin_node_id) {
                        origin_node = this.graph.getNodeById(origin_node_id);
                    }
                }
                var target_node = nodes[link_info[2]];
                if (origin_node && target_node)
                    origin_node.connect(link_info[1], target_node, link_info[3]);

                else
                    console.warn("Warning, nodes missing on pasting");
            }

            this.selectNodes(nodes);

            this.graph.afterChange();
        }
        /**
             * process a item drop event on top the canvas
             * @method processDrop
             **/
        processDrop(e) {
            e.preventDefault();
            this.adjustMouseEvent(e);
            var x = e.clientX;
            var y = e.clientY;
            var is_inside = !this.viewport || (this.viewport && x >= this.viewport[0] && x < (this.viewport[0] + this.viewport[2]) && y >= this.viewport[1] && y < (this.viewport[1] + this.viewport[3]));
            if (!is_inside) {
                return;
                // --- BREAK ---
            }

            var pos = [e.canvasX, e.canvasY];


            var node = this.graph ? this.graph.getNodeOnPos(pos[0], pos[1]) : null;

            if (!node) {
                var r = null;
                if (this.onDropItem) {
                    r = this.onDropItem(event);
                }
                if (!r) {
                    this.checkDropItem(e);
                }
                return;
            }

            if (node.onDropFile || node.onDropData) {
                var files = e.dataTransfer.files;
                if (files && files.length) {
                    for (var i = 0; i < files.length; i++) {
                        var file = e.dataTransfer.files[0];
                        var filename = file.name;
                        var ext = LGraphCanvas.getFileExtension(filename);
                        //console.log(file);
                        if (node.onDropFile) {
                            node.onDropFile(file);
                        }

                        if (node.onDropData) {
                            //prepare reader
                            var reader = new FileReader();
                            reader.onload = function (event) {
                                //console.log(event.target);
                                var data = event.target.result;
                                node.onDropData(data, filename, file);
                            };

                            //read data
                            var type = file.type.split("/")[0];
                            if (type == "text" || type == "") {
                                reader.readAsText(file);
                            } else if (type == "image") {
                                reader.readAsDataURL(file);
                            } else {
                                reader.readAsArrayBuffer(file);
                            }
                        }
                    }
                }
            }

            if (node.onDropItem) {
                if (node.onDropItem(event)) {
                    return true;
                }
            }

            if (this.onDropItem) {
                return this.onDropItem(event);
            }

            return false;
        }
        //called if the graph doesn't have a default drop item behaviour
        checkDropItem(e) {
            if (e.dataTransfer.files.length) {
                var file = e.dataTransfer.files[0];
                var ext = LGraphCanvas.getFileExtension(file.name).toLowerCase();
                var nodetype = LiteGraph.node_types_by_file_extension[ext];
                if (nodetype) {
                    this.graph.beforeChange();
                    var node = LiteGraph.createNode(nodetype.type);
                    node.pos = [e.canvasX, e.canvasY];
                    this.graph.add(node);
                    if (node.onDropFile) {
                        node.onDropFile(file);
                    }
                    this.graph.afterChange();
                }
            }
        }
        processNodeDblClicked(n) {
            if (this.onShowNodePanel) {
                this.onShowNodePanel(n);
            }

            if (this.onNodeDblClicked) {
                this.onNodeDblClicked(n);
            }

            this.setDirty(true);
        }
        processNodeSelected(node, e) {
            this.selectNode(node, e && (e.shiftKey || e.ctrlKey || this.multi_select));
            if (this.onNodeSelected) {
                this.onNodeSelected(node);
            }
        }
        /**
             * selects a given node (or adds it to the current selection)
             * @method selectNode
             **/
        selectNode(node,
            add_to_current_selection) {
            if (node == null) {
                this.deselectAllNodes();
            } else {
                this.selectNodes([node], add_to_current_selection);
            }
        }
        /**
             * selects several nodes (or adds them to the current selection)
             * @method selectNodes
             **/
        selectNodes(nodes, add_to_current_selection) {
            if (!add_to_current_selection) {
                this.deselectAllNodes();
            }

            nodes = nodes || this.graph._nodes;
            if (typeof nodes == "string") nodes = [nodes];
            for (var i in nodes) {
                var node = nodes[i];
                if (node.is_selected) {
                    this.deselectNode(node);
                    continue;
                }

                if (!node.is_selected && node.onSelected) {
                    node.onSelected();
                }
                node.is_selected = true;
                this.selected_nodes[node.id] = node;

                if (node.inputs) {
                    for (var j = 0; j < node.inputs.length; ++j) {
                        this.highlighted_links[node.inputs[j].link] = true;
                    }
                }
                if (node.outputs) {
                    for (var j = 0; j < node.outputs.length; ++j) {
                        var out = node.outputs[j];
                        if (out.links) {
                            for (var k = 0; k < out.links.length; ++k) {
                                this.highlighted_links[out.links[k]] = true;
                            }
                        }
                    }
                }
            }

            if (this.onSelectionChange)
                this.onSelectionChange(this.selected_nodes);

            this.setDirty(true);
        }
        /**
             * removes a node from the current selection
             * @method deselectNode
             **/
        deselectNode(node) {
            if (!node.is_selected) {
                return;
            }
            if (node.onDeselected) {
                node.onDeselected();
            }
            node.is_selected = false;
            delete this.selected_nodes[node.id];

            if (this.onNodeDeselected) {
                this.onNodeDeselected(node);
            }

            //remove highlighted
            if (node.inputs) {
                for (var i = 0; i < node.inputs.length; ++i) {
                    delete this.highlighted_links[node.inputs[i].link];
                }
            }
            if (node.outputs) {
                for (var i = 0; i < node.outputs.length; ++i) {
                    var out = node.outputs[i];
                    if (out.links) {
                        for (var j = 0; j < out.links.length; ++j) {
                            delete this.highlighted_links[out.links[j]];
                        }
                    }
                }
            }
        }
        /**
             * removes all nodes from the current selection
             * @method deselectAllNodes
             **/
        deselectAllNodes() {
            if (!this.graph) {
                return;
            }
            var nodes = this.graph._nodes;
            for (var i = 0, l = nodes.length; i < l; ++i) {
                var node = nodes[i];
                if (!node.is_selected) {
                    continue;
                }
                if (node.onDeselected) {
                    node.onDeselected();
                }
                node.is_selected = false;
                if (this.onNodeDeselected) {
                    this.onNodeDeselected(node);
                }
            }
            this.selected_nodes = {};
            this.current_node = null;
            this.highlighted_links = {};
            if (this.onSelectionChange)
                this.onSelectionChange(this.selected_nodes);
            this.setDirty(true);
        }
        /**
             * deletes all nodes in the current selection from the graph
             * @method deleteSelectedNodes
             **/
        deleteSelectedNodes() {

            this.graph.beforeChange();

            for (var i in this.selected_nodes) {
                var node = this.selected_nodes[i];

                if (node.block_delete)
                    continue;

                //autoconnect when possible (very basic, only takes into account first input-output)
                if (node.inputs && node.inputs.length && node.outputs && node.outputs.length && LiteGraph.isValidConnection(node.inputs[0].type, node.outputs[0].type) && node.inputs[0].link && node.outputs[0].links && node.outputs[0].links.length) {
                    var input_link = node.graph.links[node.inputs[0].link];
                    var output_link = node.graph.links[node.outputs[0].links[0]];
                    var input_node = node.getInputNode(0);
                    var output_node = node.getOutputNodes(0)[0];
                    if (input_node && output_node)
                        input_node.connect(input_link.origin_slot, output_node, output_link.target_slot);
                }
                this.graph.remove(node);
                if (this.onNodeDeselected) {
                    this.onNodeDeselected(node);
                }
            }
            this.selected_nodes = {};
            this.current_node = null;
            this.highlighted_links = {};
            this.setDirty(true);
            this.graph.afterChange();
        }
        /**
             * centers the camera on a given node
             * @method centerOnNode
             **/
        centerOnNode(node) {
            const dpi = window?.devicePixelRatio || 1;
            this.ds.offset[0] =
                -node.pos[0] -
                node.size[0] * 0.5 +
                (this.canvas.width * 0.5) / (this.ds.scale * dpi);
            this.ds.offset[1] =
                -node.pos[1] -
                node.size[1] * 0.5 +
                (this.canvas.height * 0.5) / (this.ds.scale * dpi);
            this.setDirty(true, true);
        }
        /**
             * adds some useful properties to a mouse event, like the position in graph coordinates
             * @method adjustMouseEvent
             **/
        adjustMouseEvent(e) {
            var clientX_rel = 0;
            var clientY_rel = 0;

            if (this.canvas) {
                var b = this.canvas.getBoundingClientRect();
                clientX_rel = e.clientX - b.left;
                clientY_rel = e.clientY - b.top;
            } else {
                clientX_rel = e.clientX;
                clientY_rel = e.clientY;
            }

            // Only set deltaX and deltaY if not already set.
            // If deltaX and deltaY are already present, they are read-only.
            // Setting them would result browser error => zoom in/out feature broken.
            if (e.deltaX === undefined)
                e.deltaX = clientX_rel - this.last_mouse_position[0];
            if (e.deltaY === undefined)
                e.deltaY = clientY_rel - this.last_mouse_position[1];

            this.last_mouse_position[0] = clientX_rel;
            this.last_mouse_position[1] = clientY_rel;

            e.canvasX = clientX_rel / this.ds.scale - this.ds.offset[0];
            e.canvasY = clientY_rel / this.ds.scale - this.ds.offset[1];

            //console.log("pointerevents: adjustMouseEvent "+e.clientX+":"+e.clientY+" "+clientX_rel+":"+clientY_rel+" "+e.canvasX+":"+e.canvasY);
        }
        /**
             * changes the zoom level of the graph (default is 1), you can pass also a place used to pivot the zoom
             * @method setZoom
             **/
        setZoom(value, zooming_center) {
            this.ds.changeScale(value, zooming_center);
            /*
        if(!zooming_center && this.canvas)
            zooming_center = [this.canvas.width * 0.5,this.canvas.height * 0.5];
    
        var center = this.convertOffsetToCanvas( zooming_center );
    
        this.ds.scale = value;
    
        if(this.scale > this.max_zoom)
            this.scale = this.max_zoom;
        else if(this.scale < this.min_zoom)
            this.scale = this.min_zoom;
    
        var new_center = this.convertOffsetToCanvas( zooming_center );
        var delta_offset = [new_center[0] - center[0], new_center[1] - center[1]];
    
        this.offset[0] += delta_offset[0];
        this.offset[1] += delta_offset[1];
        */
            this.dirty_canvas = true;
            this.dirty_bgcanvas = true;
        }
        /**
             * converts a coordinate from graph coordinates to canvas2D coordinates
             * @method convertOffsetToCanvas
             **/
        convertOffsetToCanvas(pos, out) {
            return this.ds.convertOffsetToCanvas(pos, out);
        }
        /**
             * converts a coordinate from Canvas2D coordinates to graph space
             * @method convertCanvasToOffset
             **/
        convertCanvasToOffset(pos, out) {
            return this.ds.convertCanvasToOffset(pos, out);
        }
        //converts event coordinates from canvas2D to graph coordinates
        convertEventToCanvasOffset(e) {
            var rect = this.canvas.getBoundingClientRect();
            return this.convertCanvasToOffset([
                e.clientX - rect.left,
                e.clientY - rect.top
            ]);
        }
        /**
             * brings a node to front (above all other nodes)
             * @method bringToFront
             **/
        bringToFront(node) {
            var i = this.graph._nodes.indexOf(node);
            if (i == -1) {
                return;
            }

            this.graph._nodes.splice(i, 1);
            this.graph._nodes.push(node);
        }
        /**
             * sends a node to the back (below all other nodes)
             * @method sendToBack
             **/
        sendToBack(node) {
            var i = this.graph._nodes.indexOf(node);
            if (i == -1) {
                return;
            }

            this.graph._nodes.splice(i, 1);
            this.graph._nodes.unshift(node);
        }

        /* LGraphCanvas render */
        /**
         * checks which nodes are visible (inside the camera area)
         * @method computeVisibleNodes
         **/
        computeVisibleNodes(nodes, out) {
            var visible_nodes = out || [];
            visible_nodes.length = 0;
            nodes = nodes || this.graph._nodes;
            for (var i = 0, l = nodes.length; i < l; ++i) {
                var n = nodes[i];

                //skip rendering nodes in live mode
                if (this.live_mode && !n.onDrawBackground && !n.onDrawForeground) {
                    continue;
                }

                if (!overlapBounding(this.visible_area, n.getBounding(LGraphCanvas.#temp, true))) {
                    continue;
                } //out of the visible area

                visible_nodes.push(n);
            }
            return visible_nodes;
        }
        /**
             * renders the whole canvas content, by rendering in two separated canvas, one containing the background grid and the connections, and one containing the nodes)
             * @method draw
             **/
        draw(force_canvas, force_bgcanvas) {
            if (!this.canvas || this.canvas.width == 0 || this.canvas.height == 0) {
                return;
            }

            //fps counting
            var now = LiteGraph.getTime();
            this.render_time = (now - this.last_draw_time) * 0.001;
            this.last_draw_time = now;

            if (this.graph) {
                this.ds.computeVisibleArea(this.viewport);
            }

            if (this.dirty_bgcanvas ||
                force_bgcanvas ||
                this.always_render_background ||
                (this.graph &&
                    this.graph._last_trigger_time &&
                    now - this.graph._last_trigger_time < 1000)) {
                this.drawBackCanvas();
            }

            if (this.dirty_canvas || force_canvas) {
                this.drawFrontCanvas();
            }

            this.fps = this.render_time ? 1.0 / this.render_time : 0;
            this.frame += 1;
        }
        /**
             * draws the front canvas (the one containing all the nodes)
             * @method drawFrontCanvas
             **/
        drawFrontCanvas() {
            this.dirty_canvas = false;

            if (!this.ctx) {
                this.ctx = this.bgcanvas.getContext("2d");
            }
            var ctx = this.ctx;
            if (!ctx) {
                //maybe is using webgl...
                return;
            }

            var canvas = this.canvas;
            if (ctx.start2D && !this.viewport) {
                ctx.start2D();
                ctx.restore();
                ctx.setTransform(1, 0, 0, 1, 0, 0);
            }

            //clip dirty area if there is one, otherwise work in full canvas
            var area = this.viewport || this.dirty_area;
            if (area) {
                ctx.save();
                ctx.beginPath();
                ctx.rect(area[0], area[1], area[2], area[3]);
                ctx.clip();
            }

            //clear
            //canvas.width = canvas.width;
            if (this.clear_background) {
                if (area)
                    ctx.clearRect(area[0], area[1], area[2], area[3]);

                else
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
            }

            //draw bg canvas
            if (this.bgcanvas == this.canvas) {
                this.drawBackCanvas();
            } else {
                let scale = window.devicePixelRatio;
                ctx.drawImage(this.bgcanvas, 0, 0, this.bgcanvas.width / scale, this.bgcanvas.height / scale);
            }

            //rendering
            if (this.onRender) {
                this.onRender(canvas, ctx);
            }

            //info widget
            if (this.show_info) {
                this.renderInfo(ctx, area ? area[0] : 0, area ? area[1] : 0);
            }

            if (this.graph) {
                //apply transformations
                ctx.save();
                this.ds.toCanvasContext(ctx);

                //draw nodes
                var drawn_nodes = 0;
                var visible_nodes = this.computeVisibleNodes(
                    null,
                    this.visible_nodes
                );

                for (var i = 0; i < visible_nodes.length; ++i) {
                    var node = visible_nodes[i];

                    //transform coords system
                    ctx.save();
                    ctx.translate(node.pos[0], node.pos[1]);

                    //Draw
                    this.drawNode(node, ctx);
                    drawn_nodes += 1;

                    //Restore
                    ctx.restore();
                }

                //on top (debug)
                if (this.render_execution_order) {
                    this.drawExecutionOrder(ctx);
                }

                //connections ontop?
                if (this.graph.config.links_ontop) {
                    if (!this.live_mode) {
                        this.drawConnections(ctx);
                    }
                }

                if (this.connecting_links) {
                    //current connection (the one being dragged by the mouse)
                    for (const link of this.connecting_links) {
                        ctx.lineWidth = this.connections_width;
                        var link_color = null;

                        var connInOrOut = link.output || link.input;

                        var connType = connInOrOut.type;
                        var connDir = connInOrOut.dir;
                        if (connDir == null) {
                            if (link.output)
                                connDir = link.node.horizontal ? LiteGraph.DOWN : LiteGraph.RIGHT;

                            else
                                connDir = link.node.horizontal ? LiteGraph.UP : LiteGraph.LEFT;
                        }
                        var connShape = connInOrOut.shape;

                        switch (connType) {
                            case LiteGraph.EVENT:
                                link_color = LiteGraph.EVENT_LINK_COLOR;
                                break;
                            default:
                                link_color = LiteGraph.CONNECTING_LINK_COLOR;
                        }

                        //the connection being dragged by the mouse
                        this.renderLink(
                            ctx,
                            link.pos,
                            [this.graph_mouse[0], this.graph_mouse[1]],
                            null,
                            false,
                            null,
                            link_color,
                            connDir,
                            LiteGraph.CENTER
                        );

                        ctx.beginPath();
                        if (connType === LiteGraph.EVENT ||
                            connShape === LiteGraph.BOX_SHAPE) {
                            ctx.rect(
                                link.pos[0] - 6 + 0.5,
                                link.pos[1] - 5 + 0.5,
                                14,
                                10
                            );
                            ctx.fill();
                            ctx.beginPath();
                            ctx.rect(
                                this.graph_mouse[0] - 6 + 0.5,
                                this.graph_mouse[1] - 5 + 0.5,
                                14,
                                10
                            );
                        } else if (connShape === LiteGraph.ARROW_SHAPE) {
                            ctx.moveTo(link.pos[0] + 8, link.pos[1] + 0.5);
                            ctx.lineTo(link.pos[0] - 4, link.pos[1] + 6 + 0.5);
                            ctx.lineTo(link.pos[0] - 4, link.pos[1] - 6 + 0.5);
                            ctx.closePath();
                        }
                        else {
                            ctx.arc(
                                link.pos[0],
                                link.pos[1],
                                4,
                                0,
                                Math.PI * 2
                            );
                            ctx.fill();
                            ctx.beginPath();
                            ctx.arc(
                                this.graph_mouse[0],
                                this.graph_mouse[1],
                                4,
                                0,
                                Math.PI * 2
                            );
                        }
                        ctx.fill();

                        ctx.fillStyle = "#ffcc00";
                        if (this._highlight_input) {
                            ctx.beginPath();
                            var shape = this._highlight_input_slot.shape;
                            if (shape === LiteGraph.ARROW_SHAPE) {
                                ctx.moveTo(this._highlight_input[0] + 8, this._highlight_input[1] + 0.5);
                                ctx.lineTo(this._highlight_input[0] - 4, this._highlight_input[1] + 6 + 0.5);
                                ctx.lineTo(this._highlight_input[0] - 4, this._highlight_input[1] - 6 + 0.5);
                                ctx.closePath();
                            } else {
                                ctx.arc(
                                    this._highlight_input[0],
                                    this._highlight_input[1],
                                    6,
                                    0,
                                    Math.PI * 2
                                );
                            }
                            ctx.fill();
                        }
                        if (this._highlight_output) {
                            ctx.beginPath();
                            if (shape === LiteGraph.ARROW_SHAPE) {
                                ctx.moveTo(this._highlight_output[0] + 8, this._highlight_output[1] + 0.5);
                                ctx.lineTo(this._highlight_output[0] - 4, this._highlight_output[1] + 6 + 0.5);
                                ctx.lineTo(this._highlight_output[0] - 4, this._highlight_output[1] - 6 + 0.5);
                                ctx.closePath();
                            } else {
                                ctx.arc(
                                    this._highlight_output[0],
                                    this._highlight_output[1],
                                    6,
                                    0,
                                    Math.PI * 2
                                );
                            }
                            ctx.fill();
                        }
                    }
                }

                //the selection rectangle
                if (this.dragging_rectangle) {
                    ctx.strokeStyle = "#FFF";
                    ctx.strokeRect(
                        this.dragging_rectangle[0],
                        this.dragging_rectangle[1],
                        this.dragging_rectangle[2],
                        this.dragging_rectangle[3]
                    );
                }

                //on top of link center
                if (this.over_link_center && this.render_link_tooltip)
                    this.drawLinkTooltip(ctx, this.over_link_center);

                else if (this.onDrawLinkTooltip) //to remove
                    this.onDrawLinkTooltip(ctx, null);

                //custom info
                if (this.onDrawForeground) {
                    this.onDrawForeground(ctx, this.visible_rect);
                }

                ctx.restore();
            }

            //draws panel in the corner 
            if (this._graph_stack && this._graph_stack.length) {
                this.drawSubgraphPanel(ctx);
            }


            if (this.onDrawOverlay) {
                this.onDrawOverlay(ctx);
            }

            if (area) {
                ctx.restore();
            }

            if (ctx.finish2D) {
                //this is a function I use in webgl renderer
                ctx.finish2D();
            }
        }
        /**
             * draws the panel in the corner that shows subgraph properties
             * @method drawSubgraphPanel
             **/
        drawSubgraphPanel(ctx) {
            var subgraph = this.graph;
            var subnode = subgraph._subgraph_node;
            if (!subnode) {
                console.warn("subgraph without subnode");
                return;
            }
            this.drawSubgraphPanelLeft(subgraph, subnode, ctx);
            this.drawSubgraphPanelRight(subgraph, subnode, ctx);
        }
        drawSubgraphPanelLeft(subgraph, subnode, ctx) {
            var num = subnode.inputs ? subnode.inputs.length : 0;
            var w = 200;
            var h = Math.floor(LiteGraph.NODE_SLOT_HEIGHT * 1.6);

            ctx.fillStyle = "#111";
            ctx.globalAlpha = 0.8;
            ctx.beginPath();
            ctx.roundRect(10, 10, w, (num + 1) * h + 50, [8]);
            ctx.fill();
            ctx.globalAlpha = 1;

            ctx.fillStyle = "#888";
            ctx.font = "14px Arial";
            ctx.textAlign = "left";
            ctx.fillText("Graph Inputs", 20, 34);
            // var pos = this.mouse;
            if (this.drawButton(w - 20, 20, 20, 20, "X", "#151515")) {
                this.closeSubgraph();
                return;
            }

            var y = 50;
            ctx.font = "14px Arial";
            if (subnode.inputs)
                for (var i = 0; i < subnode.inputs.length; ++i) {
                    var input = subnode.inputs[i];
                    if (input.not_subgraph_input)
                        continue;

                    //input button clicked
                    if (this.drawButton(20, y + 2, w - 20, h - 2)) {
                        var type = subnode.constructor.input_node_type || "graph/input";
                        this.graph.beforeChange();
                        var newnode = LiteGraph.createNode(type);
                        if (newnode) {
                            subgraph.add(newnode);
                            this.block_click = false;
                            this.last_click_position = null;
                            this.selectNodes([newnode]);
                            this.node_dragged = newnode;
                            this.dragging_canvas = false;
                            newnode.setProperty("name", input.name);
                            newnode.setProperty("type", input.type);
                            this.node_dragged.pos[0] = this.graph_mouse[0] - 5;
                            this.node_dragged.pos[1] = this.graph_mouse[1] - 5;
                            this.graph.afterChange();
                        }

                        else
                            console.error("graph input node not found:", type);
                    }
                    ctx.fillStyle = "#9C9";
                    ctx.beginPath();
                    ctx.arc(w - 16, y + h * 0.5, 5, 0, 2 * Math.PI);
                    ctx.fill();
                    ctx.fillStyle = "#AAA";
                    ctx.fillText(input.name, 30, y + h * 0.75);
                    // var tw = ctx.measureText(input.name);
                    ctx.fillStyle = "#777";
                    ctx.fillText(input.type, 130, y + h * 0.75);
                    y += h;
                }
            //add + button
            if (this.drawButton(20, y + 2, w - 20, h - 2, "+", "#151515", "#222")) {
                this.showSubgraphPropertiesDialog(subnode);
            }
        }
        drawSubgraphPanelRight(subgraph, subnode, ctx) {
            var num = subnode.outputs ? subnode.outputs.length : 0;
            var canvas_w = this.bgcanvas.width;
            var w = 200;
            var h = Math.floor(LiteGraph.NODE_SLOT_HEIGHT * 1.6);

            ctx.fillStyle = "#111";
            ctx.globalAlpha = 0.8;
            ctx.beginPath();
            ctx.roundRect(canvas_w - w - 10, 10, w, (num + 1) * h + 50, [8]);
            ctx.fill();
            ctx.globalAlpha = 1;

            ctx.fillStyle = "#888";
            ctx.font = "14px Arial";
            ctx.textAlign = "left";
            var title_text = "Graph Outputs";
            var tw = ctx.measureText(title_text).width;
            ctx.fillText(title_text, (canvas_w - tw) - 20, 34);
            // var pos = this.mouse;
            if (this.drawButton(canvas_w - w, 20, 20, 20, "X", "#151515")) {
                this.closeSubgraph();
                return;
            }

            var y = 50;
            ctx.font = "14px Arial";
            if (subnode.outputs)
                for (var i = 0; i < subnode.outputs.length; ++i) {
                    var output = subnode.outputs[i];
                    if (output.not_subgraph_input)
                        continue;

                    //output button clicked
                    if (this.drawButton(canvas_w - w, y + 2, w - 20, h - 2)) {
                        var type = subnode.constructor.output_node_type || "graph/output";
                        this.graph.beforeChange();
                        var newnode = LiteGraph.createNode(type);
                        if (newnode) {
                            subgraph.add(newnode);
                            this.block_click = false;
                            this.last_click_position = null;
                            this.selectNodes([newnode]);
                            this.node_dragged = newnode;
                            this.dragging_canvas = false;
                            newnode.setProperty("name", output.name);
                            newnode.setProperty("type", output.type);
                            this.node_dragged.pos[0] = this.graph_mouse[0] - 5;
                            this.node_dragged.pos[1] = this.graph_mouse[1] - 5;
                            this.graph.afterChange();
                        }

                        else
                            console.error("graph input node not found:", type);
                    }
                    ctx.fillStyle = "#9C9";
                    ctx.beginPath();
                    ctx.arc(canvas_w - w + 16, y + h * 0.5, 5, 0, 2 * Math.PI);
                    ctx.fill();
                    ctx.fillStyle = "#AAA";
                    ctx.fillText(output.name, canvas_w - w + 30, y + h * 0.75);
                    // var tw = ctx.measureText(input.name);
                    ctx.fillStyle = "#777";
                    ctx.fillText(output.type, canvas_w - w + 130, y + h * 0.75);
                    y += h;
                }
            //add + button
            if (this.drawButton(canvas_w - w, y + 2, w - 20, h - 2, "+", "#151515", "#222")) {
                this.showSubgraphPropertiesDialogRight(subnode);
            }
        }
        //Draws a button into the canvas overlay and computes if it was clicked using the immediate gui paradigm
        drawButton(x, y, w, h, text, bgcolor, hovercolor, textcolor) {
            var ctx = this.ctx;
            bgcolor = bgcolor || LiteGraph.NODE_DEFAULT_COLOR;
            hovercolor = hovercolor || "#555";
            textcolor = textcolor || LiteGraph.NODE_TEXT_COLOR;
            var pos = this.ds.convertOffsetToCanvas(this.graph_mouse);
            var hover = LiteGraph.isInsideRectangle(pos[0], pos[1], x, y, w, h);
            pos = this.last_click_position ? [this.last_click_position[0], this.last_click_position[1]] : null;
            if (pos) {
                var rect = this.canvas.getBoundingClientRect();
                pos[0] -= rect.left;
                pos[1] -= rect.top;
            }
            var clicked = pos && LiteGraph.isInsideRectangle(pos[0], pos[1], x, y, w, h);

            ctx.fillStyle = hover ? hovercolor : bgcolor;
            if (clicked)
                ctx.fillStyle = "#AAA";
            ctx.beginPath();
            ctx.roundRect(x, y, w, h, [4]);
            ctx.fill();

            if (text != null) {
                if (text.constructor == String) {
                    ctx.fillStyle = textcolor;
                    ctx.textAlign = "center";
                    ctx.font = ((h * 0.65) | 0) + "px Arial";
                    ctx.fillText(text, x + w * 0.5, y + h * 0.75);
                    ctx.textAlign = "left";
                }
            }

            var was_clicked = clicked && !this.block_click;
            if (clicked)
                this.blockClick();
            return was_clicked;
        }
        isAreaClicked(x, y, w, h, hold_click) {
            var pos = this.mouse;
            var hover = LiteGraph.isInsideRectangle(pos[0], pos[1], x, y, w, h);
            pos = this.last_click_position;
            var clicked = pos && LiteGraph.isInsideRectangle(pos[0], pos[1], x, y, w, h);
            var was_clicked = clicked && !this.block_click;
            if (clicked && hold_click)
                this.blockClick();
            return was_clicked;
        }
        /**
             * draws some useful stats in the corner of the canvas
             * @method renderInfo
             **/
        renderInfo(ctx, x, y) {
            x = x || 10;
            y = y || this.canvas.offsetHeight - 80;

            ctx.save();
            ctx.translate(x, y);

            ctx.font = "10px Arial";
            ctx.fillStyle = "#888";
            ctx.textAlign = "left";
            if (this.graph) {
                ctx.fillText("T: " + this.graph.globaltime.toFixed(2) + "s", 5, 13 * 1);
                ctx.fillText("I: " + this.graph.iteration, 5, 13 * 2);
                ctx.fillText("N: " + this.graph._nodes.length + " [" + this.visible_nodes.length + "]", 5, 13 * 3);
                ctx.fillText("V: " + this.graph._version, 5, 13 * 4);
                ctx.fillText("FPS:" + this.fps.toFixed(2), 5, 13 * 5);
            } else {
                ctx.fillText("No graph selected", 5, 13 * 1);
            }
            ctx.restore();
        }
        /**
             * draws the back canvas (the one containing the background and the connections)
             * @method drawBackCanvas
             **/
        drawBackCanvas() {
            var canvas = this.bgcanvas;
            if (canvas.width != this.canvas.width ||
                canvas.height != this.canvas.height) {
                canvas.width = this.canvas.width;
                canvas.height = this.canvas.height;
            }

            if (!this.bgctx) {
                this.bgctx = this.bgcanvas.getContext("2d");
            }
            var ctx = this.bgctx;
            if (ctx.start) {
                ctx.start();
            }

            var viewport = this.viewport || [0, 0, ctx.canvas.width, ctx.canvas.height];

            //clear
            if (this.clear_background) {
                ctx.clearRect(viewport[0], viewport[1], viewport[2], viewport[3]);
            }

            //show subgraph stack header
            if (this._graph_stack && this._graph_stack.length) {
                ctx.save();
                var parent_graph = this._graph_stack[this._graph_stack.length - 1];
                var subgraph_node = this.graph._subgraph_node;
                ctx.strokeStyle = subgraph_node.bgcolor;
                ctx.lineWidth = 10;
                ctx.strokeRect(1, 1, canvas.width - 2, canvas.height - 2);
                ctx.lineWidth = 1;
                ctx.font = "40px Arial";
                ctx.textAlign = "center";
                ctx.fillStyle = subgraph_node.bgcolor || "#AAA";
                var title = "";
                for (var i = 1; i < this._graph_stack.length; ++i) {
                    title +=
                        this._graph_stack[i]._subgraph_node.getTitle() + " >> ";
                }
                ctx.fillText(
                    title + subgraph_node.getTitle(),
                    canvas.width * 0.5,
                    40
                );
                ctx.restore();
            }

            var bg_already_painted = false;
            if (this.onRenderBackground) {
                bg_already_painted = this.onRenderBackground(canvas, ctx);
            }

            //reset in case of error
            if (!this.viewport) {
                let scale = window.devicePixelRatio;
                ctx.restore();
                ctx.setTransform(scale, 0, 0, scale, 0, 0);
            }
            this.visible_links.length = 0;

            if (this.graph) {
                //apply transformations
                ctx.save();
                this.ds.toCanvasContext(ctx);

                //render BG
                if (this.ds.scale < 1.5 && !bg_already_painted && this.clear_background_color) {
                    ctx.fillStyle = this.clear_background_color;
                    ctx.fillRect(
                        this.visible_area[0],
                        this.visible_area[1],
                        this.visible_area[2],
                        this.visible_area[3]
                    );
                }

                if (this.background_image &&
                    this.ds.scale > 0.5 &&
                    !bg_already_painted) {
                    if (this.zoom_modify_alpha) {
                        ctx.globalAlpha =
                            (1.0 - 0.5 / this.ds.scale) * this.editor_alpha;
                    } else {
                        ctx.globalAlpha = this.editor_alpha;
                    }
                    ctx.imageSmoothingEnabled = ctx.imageSmoothingEnabled = false; // ctx.mozImageSmoothingEnabled = 
                    if (!this._bg_img ||
                        this._bg_img.name != this.background_image) {
                        this._bg_img = new Image();
                        this._bg_img.name = this.background_image;
                        this._bg_img.src = this.background_image;
                        var that = this;
                        this._bg_img.onload = function () {
                            that.draw(true, true);
                        };
                    }

                    var pattern = null;
                    if (this._pattern == null && this._bg_img.width > 0) {
                        pattern = ctx.createPattern(this._bg_img, "repeat");
                        this._pattern_img = this._bg_img;
                        this._pattern = pattern;
                    } else {
                        pattern = this._pattern;
                    }
                    if (pattern) {
                        ctx.fillStyle = pattern;
                        ctx.fillRect(
                            this.visible_area[0],
                            this.visible_area[1],
                            this.visible_area[2],
                            this.visible_area[3]
                        );
                        ctx.fillStyle = "transparent";
                    }

                    ctx.globalAlpha = 1.0;
                    ctx.imageSmoothingEnabled = ctx.imageSmoothingEnabled = true; //= ctx.mozImageSmoothingEnabled
                }

                //groups
                if (this.graph._groups.length && !this.live_mode) {
                    this.drawGroups(canvas, ctx);
                }

                if (this.onDrawBackground) {
                    this.onDrawBackground(ctx, this.visible_area);
                }
                if (this.onBackgroundRender) {
                    //LEGACY
                    console.error(
                        "WARNING! onBackgroundRender deprecated, now is named onDrawBackground "
                    );
                    this.onBackgroundRender = null;
                }

                //DEBUG: show clipping area
                //ctx.fillStyle = "red";
                //ctx.fillRect( this.visible_area[0] + 10, this.visible_area[1] + 10, this.visible_area[2] - 20, this.visible_area[3] - 20);
                //bg
                if (this.render_canvas_border) {
                    ctx.strokeStyle = "#235";
                    ctx.strokeRect(0, 0, canvas.width, canvas.height);
                }

                if (this.render_connections_shadows) {
                    ctx.shadowColor = "#000";
                    ctx.shadowOffsetX = 0;
                    ctx.shadowOffsetY = 0;
                    ctx.shadowBlur = 6;
                } else {
                    ctx.shadowColor = "rgba(0,0,0,0)";
                }

                //draw connections
                if (!this.live_mode) {
                    this.drawConnections(ctx);
                }

                ctx.shadowColor = "rgba(0,0,0,0)";

                //restore state
                ctx.restore();
            }

            if (ctx.finish) {
                ctx.finish();
            }

            this.dirty_bgcanvas = false;
            this.dirty_canvas = true; //to force to repaint the front canvas with the bgcanvas
        }
        /**
             * draws the given node inside the canvas
             * @method drawNode
             **/
        drawNode(node, ctx) {
            var glow = false;
            this.current_node = node;

            var color = node.color || node.constructor.color || LiteGraph.NODE_DEFAULT_COLOR;
            var bgcolor = node.bgcolor || node.constructor.bgcolor || LiteGraph.NODE_DEFAULT_BGCOLOR;

            //shadow and glow
            if (node.mouseOver) {
                glow = true;
            }

            var low_quality = this.ds.scale < 0.6; //zoomed out


            //only render if it forces it to do it
            if (this.live_mode) {
                if (!node.flags.collapsed) {
                    ctx.shadowColor = "transparent";
                    if (node.onDrawForeground) {
                        node.onDrawForeground(ctx, this, this.canvas);
                    }
                }
                return;
            }

            var editor_alpha = this.editor_alpha;
            ctx.globalAlpha = editor_alpha;

            if (this.render_shadows && !low_quality) {
                ctx.shadowColor = LiteGraph.DEFAULT_SHADOW_COLOR;
                ctx.shadowOffsetX = 2 * this.ds.scale;
                ctx.shadowOffsetY = 2 * this.ds.scale;
                ctx.shadowBlur = 3 * this.ds.scale;
            } else {
                ctx.shadowColor = "transparent";
            }

            //custom draw collapsed method (draw after shadows because they are affected)
            if (node.flags.collapsed &&
                node.onDrawCollapsed &&
                node.onDrawCollapsed(ctx, this) == true) {
                return;
            }

            //clip if required (mask)
            var shape = node._shape || LiteGraph.BOX_SHAPE;
            var size = LGraphCanvas.#temp_vec2;
            LGraphCanvas.#temp_vec2.set(node.size);
            var horizontal = node.horizontal; // || node.flags.horizontal;

            if (node.flags.collapsed) {
                ctx.font = this.inner_text_font;
                var title = node.getTitle ? node.getTitle() : node.title;
                if (title != null) {
                    node._collapsed_width = Math.min(
                        node.size[0],
                        ctx.measureText(title).width +
                        LiteGraph.NODE_TITLE_HEIGHT * 2
                    ); //LiteGraph.NODE_COLLAPSED_WIDTH;
                    size[0] = node._collapsed_width;
                    size[1] = 0;
                }
            }

            if (node.clip_area) {
                //Start clipping
                ctx.save();
                ctx.beginPath();
                if (shape == LiteGraph.BOX_SHAPE) {
                    ctx.rect(0, 0, size[0], size[1]);
                } else if (shape == LiteGraph.ROUND_SHAPE) {
                    ctx.roundRect(0, 0, size[0], size[1], [10]);
                } else if (shape == LiteGraph.CIRCLE_SHAPE) {
                    ctx.arc(
                        size[0] * 0.5,
                        size[1] * 0.5,
                        size[0] * 0.5,
                        0,
                        Math.PI * 2
                    );
                }
                ctx.clip();
            }

            //draw shape
            if (node.has_errors) {
                bgcolor = "red";
            }
            this.drawNodeShape(
                node,
                ctx,
                size,
                color,
                bgcolor,
                node.is_selected,
                node.mouseOver
            );
            node.drawBadges(ctx);

            ctx.shadowColor = "transparent";

            //draw foreground
            if (node.onDrawForeground) {
                node.onDrawForeground(ctx, this, this.canvas);
            }

            //connection slots
            ctx.textAlign = horizontal ? "center" : "left";
            ctx.font = this.inner_text_font;

            var render_text = !low_quality;

            var out_slot = this.connecting_links ? this.connecting_links[0].output : null;
            var in_slot = this.connecting_links ? this.connecting_links[0].input : null;
            ctx.lineWidth = 1;

            var max_y = 0;
            var slot_pos = new Float32Array(2); //to reuse


            //render inputs and outputs
            if (!node.flags.collapsed) {
                //input connection slots
                if (node.inputs) {
                    for (var i = 0; i < node.inputs.length; i++) {
                        var slot = node.inputs[i];

                        var slot_type = slot.type;
                        var slot_shape = slot.shape;

                        ctx.globalAlpha = editor_alpha;
                        //change opacity of incompatible slots when dragging a connection
                        if (out_slot && !LiteGraph.isValidConnection(slot.type, out_slot.type)) {
                            ctx.globalAlpha = 0.4 * editor_alpha;
                        }

                        ctx.fillStyle =
                            slot.link != null
                                ? slot.color_on ||
                                this.default_connection_color_byType[slot_type] ||
                                this.default_connection_color.input_on
                                : slot.color_off ||
                                this.default_connection_color_byTypeOff[slot_type] ||
                                this.default_connection_color_byType[slot_type] ||
                                this.default_connection_color.input_off;

                        var pos = node.getConnectionPos(true, i, slot_pos);
                        pos[0] -= node.pos[0];
                        pos[1] -= node.pos[1];
                        if (max_y < pos[1] + LiteGraph.NODE_SLOT_HEIGHT * 0.5) {
                            max_y = pos[1] + LiteGraph.NODE_SLOT_HEIGHT * 0.5;
                        }

                        ctx.beginPath();

                        if (slot_type == "array") {
                            slot_shape = LiteGraph.GRID_SHAPE; // place in addInput? addOutput instead?
                        }

                        var doStroke = true;

                        if (slot.type === LiteGraph.EVENT ||
                            slot.shape === LiteGraph.BOX_SHAPE) {
                            if (horizontal) {
                                ctx.rect(
                                    pos[0] - 5 + 0.5,
                                    pos[1] - 8 + 0.5,
                                    10,
                                    14
                                );
                            } else {
                                ctx.rect(
                                    pos[0] - 6 + 0.5,
                                    pos[1] - 5 + 0.5,
                                    14,
                                    10
                                );
                            }
                        } else if (slot_shape === LiteGraph.ARROW_SHAPE) {
                            ctx.moveTo(pos[0] + 8, pos[1] + 0.5);
                            ctx.lineTo(pos[0] - 4, pos[1] + 6 + 0.5);
                            ctx.lineTo(pos[0] - 4, pos[1] - 6 + 0.5);
                            ctx.closePath();
                        } else if (slot_shape === LiteGraph.GRID_SHAPE) {
                            ctx.rect(pos[0] - 4, pos[1] - 4, 2, 2);
                            ctx.rect(pos[0] - 1, pos[1] - 4, 2, 2);
                            ctx.rect(pos[0] + 2, pos[1] - 4, 2, 2);
                            ctx.rect(pos[0] - 4, pos[1] - 1, 2, 2);
                            ctx.rect(pos[0] - 1, pos[1] - 1, 2, 2);
                            ctx.rect(pos[0] + 2, pos[1] - 1, 2, 2);
                            ctx.rect(pos[0] - 4, pos[1] + 2, 2, 2);
                            ctx.rect(pos[0] - 1, pos[1] + 2, 2, 2);
                            ctx.rect(pos[0] + 2, pos[1] + 2, 2, 2);
                            doStroke = false;
                        } else {
                            if (low_quality)
                                ctx.rect(pos[0] - 4, pos[1] - 4, 8, 8); //faster

                            else
                                ctx.arc(pos[0], pos[1], 4, 0, Math.PI * 2);
                        }
                        ctx.fill();

                        //render name
                        if (render_text) {
                            var text = slot.label != null ? slot.label : slot.name;
                            if (text) {
                                ctx.fillStyle = LiteGraph.NODE_TEXT_COLOR;
                                if (horizontal || slot.dir == LiteGraph.UP) {
                                    ctx.fillText(text, pos[0], pos[1] - 10);
                                } else {
                                    ctx.fillText(text, pos[0] + 10, pos[1] + 5);
                                }
                            }
                        }
                    }
                }

                //output connection slots
                ctx.textAlign = horizontal ? "center" : "right";
                ctx.strokeStyle = "black";
                if (node.outputs) {
                    for (var i = 0; i < node.outputs.length; i++) {
                        var slot = node.outputs[i];

                        var slot_type = slot.type;
                        var slot_shape = slot.shape;

                        //change opacity of incompatible slots when dragging a connection
                        if (in_slot && !LiteGraph.isValidConnection(slot_type, in_slot.type)) {
                            ctx.globalAlpha = 0.4 * editor_alpha;
                        }

                        var pos = node.getConnectionPos(false, i, slot_pos);
                        pos[0] -= node.pos[0];
                        pos[1] -= node.pos[1];
                        if (max_y < pos[1] + LiteGraph.NODE_SLOT_HEIGHT * 0.5) {
                            max_y = pos[1] + LiteGraph.NODE_SLOT_HEIGHT * 0.5;
                        }

                        ctx.fillStyle =
                            slot.links && slot.links.length
                                ? slot.color_on ||
                                this.default_connection_color_byType[slot_type] ||
                                this.default_connection_color.output_on
                                : slot.color_off ||
                                this.default_connection_color_byTypeOff[slot_type] ||
                                this.default_connection_color_byType[slot_type] ||
                                this.default_connection_color.output_off;
                        ctx.beginPath();
                        //ctx.rect( node.size[0] - 14,i*14,10,10);
                        if (slot_type == "array") {
                            slot_shape = LiteGraph.GRID_SHAPE;
                        }

                        var doStroke = true;

                        if (slot_type === LiteGraph.EVENT ||
                            slot_shape === LiteGraph.BOX_SHAPE) {
                            if (horizontal) {
                                ctx.rect(
                                    pos[0] - 5 + 0.5,
                                    pos[1] - 8 + 0.5,
                                    10,
                                    14
                                );
                            } else {
                                ctx.rect(
                                    pos[0] - 6 + 0.5,
                                    pos[1] - 5 + 0.5,
                                    14,
                                    10
                                );
                            }
                        } else if (slot_shape === LiteGraph.ARROW_SHAPE) {
                            ctx.moveTo(pos[0] + 8, pos[1] + 0.5);
                            ctx.lineTo(pos[0] - 4, pos[1] + 6 + 0.5);
                            ctx.lineTo(pos[0] - 4, pos[1] - 6 + 0.5);
                            ctx.closePath();
                        } else if (slot_shape === LiteGraph.GRID_SHAPE) {
                            ctx.rect(pos[0] - 4, pos[1] - 4, 2, 2);
                            ctx.rect(pos[0] - 1, pos[1] - 4, 2, 2);
                            ctx.rect(pos[0] + 2, pos[1] - 4, 2, 2);
                            ctx.rect(pos[0] - 4, pos[1] - 1, 2, 2);
                            ctx.rect(pos[0] - 1, pos[1] - 1, 2, 2);
                            ctx.rect(pos[0] + 2, pos[1] - 1, 2, 2);
                            ctx.rect(pos[0] - 4, pos[1] + 2, 2, 2);
                            ctx.rect(pos[0] - 1, pos[1] + 2, 2, 2);
                            ctx.rect(pos[0] + 2, pos[1] + 2, 2, 2);
                            doStroke = false;
                        } else {
                            if (low_quality)
                                ctx.rect(pos[0] - 4, pos[1] - 4, 8, 8);

                            else
                                ctx.arc(pos[0], pos[1], 4, 0, Math.PI * 2);
                        }

                        //trigger
                        //if(slot.node_id != null && slot.slot == -1)
                        //	ctx.fillStyle = "#F85";
                        //if(slot.links != null && slot.links.length)
                        ctx.fill();
                        if (!low_quality && doStroke)
                            ctx.stroke();

                        //render output name
                        if (render_text) {
                            var text = slot.label != null ? slot.label : slot.name;
                            if (text) {
                                ctx.fillStyle = LiteGraph.NODE_TEXT_COLOR;
                                if (horizontal || slot.dir == LiteGraph.DOWN) {
                                    ctx.fillText(text, pos[0], pos[1] - 8);
                                } else {
                                    ctx.fillText(text, pos[0] - 10, pos[1] + 5);
                                }
                            }
                        }
                    }
                }

                ctx.textAlign = "left";
                ctx.globalAlpha = 1;

                if (node.widgets) {
                    var widgets_y = max_y;
                    if (horizontal || node.widgets_up) {
                        widgets_y = 2;
                    }
                    if (node.widgets_start_y != null)
                        widgets_y = node.widgets_start_y;
                    this.drawNodeWidgets(
                        node,
                        widgets_y,
                        ctx,
                        this.node_widget && this.node_widget[0] == node
                            ? this.node_widget[1]
                            : null
                    );
                }
            } else if (this.render_collapsed_slots) {
                //if collapsed
                var input_slot = null;
                var output_slot = null;

                //get first connected slot to render
                if (node.inputs) {
                    for (var i = 0; i < node.inputs.length; i++) {
                        var slot = node.inputs[i];
                        if (slot.link == null) {
                            continue;
                        }
                        input_slot = slot;
                        break;
                    }
                }
                if (node.outputs) {
                    for (var i = 0; i < node.outputs.length; i++) {
                        var slot = node.outputs[i];
                        if (!slot.links || !slot.links.length) {
                            continue;
                        }
                        output_slot = slot;
                    }
                }

                if (input_slot) {
                    var x = 0;
                    var y = LiteGraph.NODE_TITLE_HEIGHT * -0.5; //center
                    if (horizontal) {
                        x = node._collapsed_width * 0.5;
                        y = -LiteGraph.NODE_TITLE_HEIGHT;
                    }
                    ctx.fillStyle = "#686";
                    ctx.beginPath();
                    if (slot.type === LiteGraph.EVENT ||
                        slot.shape === LiteGraph.BOX_SHAPE) {
                        ctx.rect(x - 7 + 0.5, y - 4, 14, 8);
                    } else if (slot.shape === LiteGraph.ARROW_SHAPE) {
                        ctx.moveTo(x + 8, y);
                        ctx.lineTo(x + -4, y - 4);
                        ctx.lineTo(x + -4, y + 4);
                        ctx.closePath();
                    } else {
                        ctx.arc(x, y, 4, 0, Math.PI * 2);
                    }
                    ctx.fill();
                }

                if (output_slot) {
                    var x = node._collapsed_width;
                    var y = LiteGraph.NODE_TITLE_HEIGHT * -0.5; //center
                    if (horizontal) {
                        x = node._collapsed_width * 0.5;
                        y = 0;
                    }
                    ctx.fillStyle = "#686";
                    ctx.strokeStyle = "black";
                    ctx.beginPath();
                    if (slot.type === LiteGraph.EVENT ||
                        slot.shape === LiteGraph.BOX_SHAPE) {
                        ctx.rect(x - 7 + 0.5, y - 4, 14, 8);
                    } else if (slot.shape === LiteGraph.ARROW_SHAPE) {
                        ctx.moveTo(x + 6, y);
                        ctx.lineTo(x - 6, y - 4);
                        ctx.lineTo(x - 6, y + 4);
                        ctx.closePath();
                    } else {
                        ctx.arc(x, y, 4, 0, Math.PI * 2);
                    }
                    ctx.fill();
                    //ctx.stroke();
                }
            }

            if (node.clip_area) {
                ctx.restore();
            }

            ctx.globalAlpha = 1.0;
        }
        //used by this.over_link_center
        drawLinkTooltip(ctx, link) {
            var pos = link._pos;
            ctx.fillStyle = "black";
            ctx.beginPath();
            ctx.arc(pos[0], pos[1], 3, 0, Math.PI * 2);
            ctx.fill();

            if (link.data == null)
                return;

            if (this.onDrawLinkTooltip)
                if (this.onDrawLinkTooltip(ctx, link, this) == true)
                    return;

            var data = link.data;
            var text = null;

            if (data.constructor === Number)
                text = data.toFixed(2);
            else if (data.constructor === String)
                text = "\"" + data + "\"";
            else if (data.constructor === Boolean)
                text = String(data);
            else if (data.toToolTip)
                text = data.toToolTip();

            else
                text = "[" + data.constructor.name + "]";

            if (text == null)
                return;
            text = text.substr(0, 30); //avoid weird

            ctx.font = "14px Courier New";
            var info = ctx.measureText(text);
            var w = info.width + 20;
            var h = 24;
            ctx.shadowColor = "black";
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;
            ctx.shadowBlur = 3;
            ctx.fillStyle = "#454";
            ctx.beginPath();
            ctx.roundRect(pos[0] - w * 0.5, pos[1] - 15 - h, w, h, [3]);
            ctx.moveTo(pos[0] - 10, pos[1] - 15);
            ctx.lineTo(pos[0] + 10, pos[1] - 15);
            ctx.lineTo(pos[0], pos[1] - 5);
            ctx.fill();
            ctx.shadowColor = "transparent";
            ctx.textAlign = "center";
            ctx.fillStyle = "#CEC";
            ctx.fillText(text, pos[0], pos[1] - 15 - h * 0.3);
        }
        /**
         * draws the shape of the given node in the canvas
         * @method drawNodeShape
         **/
        drawNodeShape(node,
            ctx,
            size,
            fgcolor,
            bgcolor,
            selected,
            mouse_over) {
            //bg rect
            ctx.strokeStyle = fgcolor;
            ctx.fillStyle = bgcolor;

            var title_height = LiteGraph.NODE_TITLE_HEIGHT;
            var low_quality = this.ds.scale < 0.5;

            //render node area depending on shape
            var shape = node._shape || node.constructor.shape || LiteGraph.ROUND_SHAPE;

            var title_mode = node.constructor.title_mode;

            var render_title = true;
            if (title_mode == LiteGraph.TRANSPARENT_TITLE || title_mode == LiteGraph.NO_TITLE) {
                render_title = false;
            } else if (title_mode == LiteGraph.AUTOHIDE_TITLE && mouse_over) {
                render_title = true;
            }

            var area = LGraphCanvas.#tmp_area;
            area[0] = 0; //x
            area[1] = render_title ? -title_height : 0; //y
            area[2] = size[0] + 1; //w
            area[3] = render_title ? size[1] + title_height : size[1]; //h

            var old_alpha = ctx.globalAlpha;

            //full node shape
            //if(node.flags.collapsed)
            {
                ctx.beginPath();
                if (shape == LiteGraph.BOX_SHAPE || low_quality) {
                    ctx.fillRect(area[0], area[1], area[2], area[3]);
                } else if (shape == LiteGraph.ROUND_SHAPE ||
                    shape == LiteGraph.CARD_SHAPE) {
                    ctx.roundRect(
                        area[0],
                        area[1],
                        area[2],
                        area[3],
                        shape == LiteGraph.CARD_SHAPE ? [this.round_radius, this.round_radius, 0, 0] : [this.round_radius]
                    );
                } else if (shape == LiteGraph.CIRCLE_SHAPE) {
                    ctx.arc(
                        size[0] * 0.5,
                        size[1] * 0.5,
                        size[0] * 0.5,
                        0,
                        Math.PI * 2
                    );
                }
                ctx.fill();

                //separator
                if (!node.flags.collapsed && render_title) {
                    ctx.shadowColor = "transparent";
                    ctx.fillStyle = "rgba(0,0,0,0.2)";
                    ctx.fillRect(0, -1, area[2], 2);
                }
            }
            ctx.shadowColor = "transparent";

            if (node.onDrawBackground) {
                node.onDrawBackground(ctx, this, this.canvas, this.graph_mouse);
            }

            //title bg (remember, it is rendered ABOVE the node)
            if (render_title || title_mode == LiteGraph.TRANSPARENT_TITLE) {
                //title bar
                if (node.onDrawTitleBar) {
                    node.onDrawTitleBar(ctx, title_height, size, this.ds.scale, fgcolor);
                } else if (title_mode != LiteGraph.TRANSPARENT_TITLE &&
                    (node.constructor.title_color || this.render_title_colored)) {
                    var title_color = node.constructor.title_color || fgcolor;

                    if (node.flags.collapsed) {
                        ctx.shadowColor = LiteGraph.DEFAULT_SHADOW_COLOR;
                    }

                    //* gradient test
                    if (this.use_gradients) {
                        var grad = LGraphCanvas.gradients[title_color];
                        if (!grad) {
                            grad = LGraphCanvas.gradients[title_color] = ctx.createLinearGradient(0, 0, 400, 0);
                            grad.addColorStop(0, title_color); // TODO refactor: validate color !! prevent DOMException
                            grad.addColorStop(1, "#000");
                        }
                        ctx.fillStyle = grad;
                    } else {
                        ctx.fillStyle = title_color;
                    }

                    //ctx.globalAlpha = 0.5 * old_alpha;
                    ctx.beginPath();
                    if (shape == LiteGraph.BOX_SHAPE || low_quality) {
                        ctx.rect(0, -title_height, size[0] + 1, title_height);
                    } else if (shape == LiteGraph.ROUND_SHAPE || shape == LiteGraph.CARD_SHAPE) {
                        ctx.roundRect(
                            0,
                            -title_height,
                            size[0] + 1,
                            title_height,
                            node.flags.collapsed ? [this.round_radius] : [this.round_radius, this.round_radius, 0, 0]
                        );
                    }
                    ctx.fill();
                    ctx.shadowColor = "transparent";
                }

                var colState = false;
                if (LiteGraph.node_box_coloured_by_mode) {
                    if (LiteGraph.NODE_MODES_COLORS[node.mode]) {
                        colState = LiteGraph.NODE_MODES_COLORS[node.mode];
                    }
                }
                if (LiteGraph.node_box_coloured_when_on) {
                    colState = node.action_triggered ? "#FFF" : (node.execute_triggered ? "#AAA" : colState);
                }

                //title box
                var box_size = 10;
                if (node.onDrawTitleBox) {
                    node.onDrawTitleBox(ctx, title_height, size, this.ds.scale);
                } else if (shape == LiteGraph.ROUND_SHAPE ||
                    shape == LiteGraph.CIRCLE_SHAPE ||
                    shape == LiteGraph.CARD_SHAPE) {
                    if (low_quality) {
                        ctx.fillStyle = "black";
                        ctx.beginPath();
                        ctx.arc(
                            title_height * 0.5,
                            title_height * -0.5,
                            box_size * 0.5 + 1,
                            0,
                            Math.PI * 2
                        );
                        ctx.fill();
                    }

                    ctx.fillStyle = node.boxcolor || colState || LiteGraph.NODE_DEFAULT_BOXCOLOR;
                    if (low_quality)
                        ctx.fillRect(title_height * 0.5 - box_size * 0.5, title_height * -0.5 - box_size * 0.5, box_size, box_size);

                    else {
                        ctx.beginPath();
                        ctx.arc(
                            title_height * 0.5,
                            title_height * -0.5,
                            box_size * 0.5,
                            0,
                            Math.PI * 2
                        );
                        ctx.fill();
                    }
                } else {
                    if (low_quality) {
                        ctx.fillStyle = "black";
                        ctx.fillRect(
                            (title_height - box_size) * 0.5 - 1,
                            (title_height + box_size) * -0.5 - 1,
                            box_size + 2,
                            box_size + 2
                        );
                    }
                    ctx.fillStyle = node.boxcolor || colState || LiteGraph.NODE_DEFAULT_BOXCOLOR;
                    ctx.fillRect(
                        (title_height - box_size) * 0.5,
                        (title_height + box_size) * -0.5,
                        box_size,
                        box_size
                    );
                }
                ctx.globalAlpha = old_alpha;

                //title text
                if (node.onDrawTitleText) {
                    node.onDrawTitleText(
                        ctx,
                        title_height,
                        size,
                        this.ds.scale,
                        this.title_text_font,
                        selected
                    );
                }
                if (!low_quality) {
                    ctx.font = this.title_text_font;
                    var title = String(node.getTitle()) + (node.pinned ? "📌" : "");
                    if (title) {
                        if (selected) {
                            ctx.fillStyle = LiteGraph.NODE_SELECTED_TITLE_COLOR;
                        } else {
                            ctx.fillStyle =
                                node.constructor.title_text_color ||
                                this.node_title_color;
                        }
                        if (node.flags.collapsed) {
                            ctx.textAlign = "left";
                            var measure = ctx.measureText(title);
                            ctx.fillText(
                                title.substr(0, 20), //avoid urls too long
                                title_height, // + measure.width * 0.5,
                                LiteGraph.NODE_TITLE_TEXT_Y - title_height
                            );
                            ctx.textAlign = "left";
                        } else {
                            ctx.textAlign = "left";
                            ctx.fillText(
                                title,
                                title_height,
                                LiteGraph.NODE_TITLE_TEXT_Y - title_height
                            );
                        }
                    }
                }

                //subgraph box
                if (!node.flags.collapsed && node.subgraph && !node.skip_subgraph_button) {
                    var w = LiteGraph.NODE_TITLE_HEIGHT;
                    var x = node.size[0] - w;
                    var over = LiteGraph.isInsideRectangle(this.graph_mouse[0] - node.pos[0], this.graph_mouse[1] - node.pos[1], x + 2, -w + 2, w - 4, w - 4);
                    ctx.fillStyle = over ? "#888" : "#555";
                    if (shape == LiteGraph.BOX_SHAPE || low_quality)
                        ctx.fillRect(x + 2, -w + 2, w - 4, w - 4);

                    else {
                        ctx.beginPath();
                        ctx.roundRect(x + 2, -w + 2, w - 4, w - 4, [4]);
                        ctx.fill();
                    }
                    ctx.fillStyle = "#333";
                    ctx.beginPath();
                    ctx.moveTo(x + w * 0.2, -w * 0.6);
                    ctx.lineTo(x + w * 0.8, -w * 0.6);
                    ctx.lineTo(x + w * 0.5, -w * 0.3);
                    ctx.fill();
                }

                //custom title render
                if (node.onDrawTitle) {
                    node.onDrawTitle(ctx);
                }
            }

            //render selection marker
            if (selected) {
                if (node.onBounding) {
                    node.onBounding(area);
                }

                this.drawSelectionBounding(
                    ctx,
                    area,
                    {
                        shape,
                        title_height,
                        title_mode,
                        fgcolor,
                        collapsed: node.flags?.collapsed
                    }
                );
            }

            // these counter helps in conditioning drawing based on if the node has been executed or an action occurred
            if (node.execute_triggered > 0) node.execute_triggered--;
            if (node.action_triggered > 0) node.action_triggered--;
        }

        /**
         * Draws the selection bounding of an area.
         * @param {CanvasRenderingContext2D} ctx
         * @param {Vector4} area
         * @param {{
         *   shape: LiteGraph.Shape,
         *   title_height: number,
         *   title_mode: LiteGraph.TitleMode,
         *   fgcolor: string,
         *   padding: number,
         * }} options
         */
        drawSelectionBounding(
            ctx,
            area,
            {
                shape = LiteGraph.BOX_SHAPE,
                title_height = LiteGraph.NODE_TITLE_HEIGHT,
                title_mode = LiteGraph.NORMAL_TITLE,
                fgcolor = LiteGraph.NODE_BOX_OUTLINE_COLOR,
                padding = 6,
                collapsed = false
            } = {}
        ) {
            // Adjust area if title is transparent
            if (title_mode === LiteGraph.TRANSPARENT_TITLE) {
                area[1] -= title_height;
                area[3] += title_height;
            }

            // Set up context
            ctx.lineWidth = 1;
            ctx.globalAlpha = 0.8;
            ctx.beginPath();

            // Draw shape based on type
            const [x, y, width, height] = area;
            switch (shape) {
                case LiteGraph.BOX_SHAPE: {
                    ctx.rect(x - padding, y - padding, width + 2 * padding, height + 2 * padding);
                    break;
                }
                case LiteGraph.ROUND_SHAPE:
                case LiteGraph.CARD_SHAPE: {
                    const radius = this.round_radius * 2;
                    const isCollapsed = shape === LiteGraph.CARD_SHAPE && collapsed;
                    const cornerRadii = isCollapsed || shape === LiteGraph.ROUND_SHAPE ? [radius] : [radius, 2, radius, 2];
                    ctx.roundRect(x - padding, y - padding, width + 2 * padding, height + 2 * padding, cornerRadii);
                    break;
                }
                case LiteGraph.CIRCLE_SHAPE: {
                    const centerX = x + width / 2;
                    const centerY = y + height / 2;
                    const radius = Math.max(width, height) / 2 + padding;
                    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
                    break;
                }
            }

            // Stroke the shape
            ctx.strokeStyle = LiteGraph.NODE_BOX_OUTLINE_COLOR;
            ctx.stroke();

            // Reset context
            ctx.strokeStyle = fgcolor;
            ctx.globalAlpha = 1;
        }

        drawConnections(ctx) {
            var now = LiteGraph.getTime();
            var visible_area = this.visible_area;
            LGraphCanvas.#margin_area[0] = visible_area[0] - 20;
            LGraphCanvas.#margin_area[1] = visible_area[1] - 20;
            LGraphCanvas.#margin_area[2] = visible_area[2] + 40;
            LGraphCanvas.#margin_area[3] = visible_area[3] + 40;

            //draw connections
            ctx.lineWidth = this.connections_width;

            ctx.fillStyle = "#AAA";
            ctx.strokeStyle = "#AAA";
            ctx.globalAlpha = this.editor_alpha;
            //for every node
            var nodes = this.graph._nodes;
            for (var n = 0, l = nodes.length; n < l; ++n) {
                var node = nodes[n];
                //for every input (we render just inputs because it is easier as every slot can only have one input)
                if (!node.inputs || !node.inputs.length) {
                    continue;
                }

                for (var i = 0; i < node.inputs.length; ++i) {
                    var input = node.inputs[i];
                    if (!input || input.link == null) {
                        continue;
                    }
                    var link_id = input.link;
                    var link = this.graph.links[link_id];
                    if (!link) {
                        continue;
                    }

                    //find link info
                    var start_node = this.graph.getNodeById(link.origin_id);
                    if (start_node == null) {
                        continue;
                    }
                    var start_node_slot = link.origin_slot;
                    var start_node_slotpos = null;
                    if (start_node_slot == -1) {
                        start_node_slotpos = [
                            start_node.pos[0] + 10,
                            start_node.pos[1] + 10
                        ];
                    } else {
                        start_node_slotpos = start_node.getConnectionPos(
                            false,
                            start_node_slot,
                            LGraphCanvas.#tempA
                        );
                    }
                    var end_node_slotpos = node.getConnectionPos(true, i, LGraphCanvas.#tempB);

                    //compute link bounding
                    LGraphCanvas.#link_bounding[0] = start_node_slotpos[0];
                    LGraphCanvas.#link_bounding[1] = start_node_slotpos[1];
                    LGraphCanvas.#link_bounding[2] = end_node_slotpos[0] - start_node_slotpos[0];
                    LGraphCanvas.#link_bounding[3] = end_node_slotpos[1] - start_node_slotpos[1];
                    if (LGraphCanvas.#link_bounding[2] < 0) {
                        LGraphCanvas.#link_bounding[0] += LGraphCanvas.#link_bounding[2];
                        LGraphCanvas.#link_bounding[2] = Math.abs(LGraphCanvas.#link_bounding[2]);
                    }
                    if (LGraphCanvas.#link_bounding[3] < 0) {
                        LGraphCanvas.#link_bounding[1] += LGraphCanvas.#link_bounding[3];
                        LGraphCanvas.#link_bounding[3] = Math.abs(LGraphCanvas.#link_bounding[3]);
                    }

                    //skip links outside of the visible area of the canvas
                    if (!overlapBounding(LGraphCanvas.#link_bounding, LGraphCanvas.#margin_area)) {
                        continue;
                    }

                    var start_slot = start_node.outputs[start_node_slot];
                    var end_slot = node.inputs[i];
                    if (!start_slot || !end_slot) {
                        continue;
                    }
                    var start_dir = start_slot.dir ||
                        (start_node.horizontal ? LiteGraph.DOWN : LiteGraph.RIGHT);
                    var end_dir = end_slot.dir ||
                        (node.horizontal ? LiteGraph.UP : LiteGraph.LEFT);

                    this.renderLink(
                        ctx,
                        start_node_slotpos,
                        end_node_slotpos,
                        link,
                        false,
                        0,
                        null,
                        start_dir,
                        end_dir
                    );

                    //event triggered rendered on top
                    if (link && link._last_time && now - link._last_time < 1000) {
                        var f = 2.0 - (now - link._last_time) * 0.002;
                        var tmp = ctx.globalAlpha;
                        ctx.globalAlpha = tmp * f;
                        this.renderLink(
                            ctx,
                            start_node_slotpos,
                            end_node_slotpos,
                            link,
                            true,
                            f,
                            "white",
                            start_dir,
                            end_dir
                        );
                        ctx.globalAlpha = tmp;
                    }
                }
            }
            ctx.globalAlpha = 1;
        }
        /**
             * draws a link between two points
             * @method renderLink
             * @param {vec2} a start pos
             * @param {vec2} b end pos
             * @param {Object} link the link object with all the link info
             * @param {boolean} skip_border ignore the shadow of the link
             * @param {boolean} flow show flow animation (for events)
             * @param {string} color the color for the link
             * @param {number} start_dir the direction enum
             * @param {number} end_dir the direction enum
             * @param {number} num_sublines number of sublines (useful to represent vec3 or rgb)
             **/
        renderLink(ctx,
            a,
            b,
            link,
            skip_border,
            flow,
            color,
            start_dir,
            end_dir,
            num_sublines) {
            if (link) {
                this.visible_links.push(link);
            }

            //choose color
            if (!color && link) {
                color = link.color || LGraphCanvas.link_type_colors[link.type];
            }
            if (!color) {
                color = this.default_link_color;
            }
            if (link != null && this.highlighted_links[link.id]) {
                color = "#FFF";
            }

            start_dir = start_dir || LiteGraph.RIGHT;
            end_dir = end_dir || LiteGraph.LEFT;

            var dist = distance(a, b);

            if (this.render_connections_border && this.ds.scale > 0.6) {
                ctx.lineWidth = this.connections_width + 4;
            }
            ctx.lineJoin = "round";
            num_sublines = num_sublines || 1;
            if (num_sublines > 1) {
                ctx.lineWidth = 0.5;
            }

            //begin line shape
            const path = new Path2D();
            if (link) {
                // Store the path on the link for hittests
                link.path = path;
            }
            for (var i = 0; i < num_sublines; i += 1) {
                var offsety = (i - (num_sublines - 1) * 0.5) * 5;

                if (this.links_render_mode == LiteGraph.SPLINE_LINK) {
                    path.moveTo(a[0], a[1] + offsety);
                    var start_offset_x = 0;
                    var start_offset_y = 0;
                    var end_offset_x = 0;
                    var end_offset_y = 0;
                    switch (start_dir) {
                        case LiteGraph.LEFT:
                            start_offset_x = dist * -0.25;
                            break;
                        case LiteGraph.RIGHT:
                            start_offset_x = dist * 0.25;
                            break;
                        case LiteGraph.UP:
                            start_offset_y = dist * -0.25;
                            break;
                        case LiteGraph.DOWN:
                            start_offset_y = dist * 0.25;
                            break;
                    }
                    switch (end_dir) {
                        case LiteGraph.LEFT:
                            end_offset_x = dist * -0.25;
                            break;
                        case LiteGraph.RIGHT:
                            end_offset_x = dist * 0.25;
                            break;
                        case LiteGraph.UP:
                            end_offset_y = dist * -0.25;
                            break;
                        case LiteGraph.DOWN:
                            end_offset_y = dist * 0.25;
                            break;
                    }
                    path.bezierCurveTo(
                        a[0] + start_offset_x,
                        a[1] + start_offset_y + offsety,
                        b[0] + end_offset_x,
                        b[1] + end_offset_y + offsety,
                        b[0],
                        b[1] + offsety
                    );
                } else if (this.links_render_mode == LiteGraph.LINEAR_LINK) {
                    path.moveTo(a[0], a[1] + offsety);
                    var start_offset_x = 0;
                    var start_offset_y = 0;
                    var end_offset_x = 0;
                    var end_offset_y = 0;
                    switch (start_dir) {
                        case LiteGraph.LEFT:
                            start_offset_x = -1;
                            break;
                        case LiteGraph.RIGHT:
                            start_offset_x = 1;
                            break;
                        case LiteGraph.UP:
                            start_offset_y = -1;
                            break;
                        case LiteGraph.DOWN:
                            start_offset_y = 1;
                            break;
                    }
                    switch (end_dir) {
                        case LiteGraph.LEFT:
                            end_offset_x = -1;
                            break;
                        case LiteGraph.RIGHT:
                            end_offset_x = 1;
                            break;
                        case LiteGraph.UP:
                            end_offset_y = -1;
                            break;
                        case LiteGraph.DOWN:
                            end_offset_y = 1;
                            break;
                    }
                    var l = 15;
                    path.lineTo(
                        a[0] + start_offset_x * l,
                        a[1] + start_offset_y * l + offsety
                    );
                    path.lineTo(
                        b[0] + end_offset_x * l,
                        b[1] + end_offset_y * l + offsety
                    );
                    path.lineTo(b[0], b[1] + offsety);
                } else if (this.links_render_mode == LiteGraph.STRAIGHT_LINK) {
                    path.moveTo(a[0], a[1]);
                    var start_x = a[0];
                    var start_y = a[1];
                    var end_x = b[0];
                    var end_y = b[1];
                    if (start_dir == LiteGraph.RIGHT) {
                        start_x += 10;
                    } else {
                        start_y += 10;
                    }
                    if (end_dir == LiteGraph.LEFT) {
                        end_x -= 10;
                    } else {
                        end_y -= 10;
                    }
                    path.lineTo(start_x, start_y);
                    path.lineTo((start_x + end_x) * 0.5, start_y);
                    path.lineTo((start_x + end_x) * 0.5, end_y);
                    path.lineTo(end_x, end_y);
                    path.lineTo(b[0], b[1]);
                } else {
                    return;
                } //unknown
            }

            //rendering the outline of the connection can be a little bit slow
            if (this.render_connections_border &&
                this.ds.scale > 0.6 &&
                !skip_border) {
                ctx.strokeStyle = "rgba(0,0,0,0.5)";
                ctx.stroke(path);
            }

            ctx.lineWidth = this.connections_width;
            ctx.fillStyle = ctx.strokeStyle = color;
            ctx.stroke(path);
            //end line shape
            var pos = this.computeConnectionPoint(a, b, 0.5, start_dir, end_dir);
            if (link && link._pos) {
                link._pos[0] = pos[0];
                link._pos[1] = pos[1];
            }

            //render arrow in the middle
            if (this.ds.scale >= 0.6 &&
                this.highquality_render &&
                end_dir != LiteGraph.CENTER) {
                //render arrow
                if (this.render_connection_arrows) {
                    //compute two points in the connection
                    var posA = this.computeConnectionPoint(
                        a,
                        b,
                        0.25,
                        start_dir,
                        end_dir
                    );
                    var posB = this.computeConnectionPoint(
                        a,
                        b,
                        0.26,
                        start_dir,
                        end_dir
                    );
                    var posC = this.computeConnectionPoint(
                        a,
                        b,
                        0.75,
                        start_dir,
                        end_dir
                    );
                    var posD = this.computeConnectionPoint(
                        a,
                        b,
                        0.76,
                        start_dir,
                        end_dir
                    );

                    //compute the angle between them so the arrow points in the right direction
                    var angleA = 0;
                    var angleB = 0;
                    if (this.render_curved_connections) {
                        angleA = -Math.atan2(posB[0] - posA[0], posB[1] - posA[1]);
                        angleB = -Math.atan2(posD[0] - posC[0], posD[1] - posC[1]);
                    } else {
                        angleB = angleA = b[1] > a[1] ? 0 : Math.PI;
                    }

                    //render arrow
                    ctx.save();
                    ctx.translate(posA[0], posA[1]);
                    ctx.rotate(angleA);
                    ctx.beginPath();
                    ctx.moveTo(-5, -3);
                    ctx.lineTo(0, +7);
                    ctx.lineTo(+5, -3);
                    ctx.fill();
                    ctx.restore();
                    ctx.save();
                    ctx.translate(posC[0], posC[1]);
                    ctx.rotate(angleB);
                    ctx.beginPath();
                    ctx.moveTo(-5, -3);
                    ctx.lineTo(0, +7);
                    ctx.lineTo(+5, -3);
                    ctx.fill();
                    ctx.restore();
                }

                //circle
                ctx.beginPath();
                ctx.arc(pos[0], pos[1], 5, 0, Math.PI * 2);
                ctx.fill();
            }

            //render flowing points
            if (flow) {
                ctx.fillStyle = color;
                for (var i = 0; i < 5; ++i) {
                    var f = (LiteGraph.getTime() * 0.001 + i * 0.2) % 1;
                    var pos = this.computeConnectionPoint(
                        a,
                        b,
                        f,
                        start_dir,
                        end_dir
                    );
                    ctx.beginPath();
                    ctx.arc(pos[0], pos[1], 5, 0, 2 * Math.PI);
                    ctx.fill();
                }
            }
        }
        //returns the link center point based on curvature
        computeConnectionPoint(a,
            b,
            t,
            start_dir,
            end_dir) {
            start_dir = start_dir || LiteGraph.RIGHT;
            end_dir = end_dir || LiteGraph.LEFT;

            var dist = distance(a, b);
            var p0 = a;
            var p1 = [a[0], a[1]];
            var p2 = [b[0], b[1]];
            var p3 = b;

            switch (start_dir) {
                case LiteGraph.LEFT:
                    p1[0] += dist * -0.25;
                    break;
                case LiteGraph.RIGHT:
                    p1[0] += dist * 0.25;
                    break;
                case LiteGraph.UP:
                    p1[1] += dist * -0.25;
                    break;
                case LiteGraph.DOWN:
                    p1[1] += dist * 0.25;
                    break;
            }
            switch (end_dir) {
                case LiteGraph.LEFT:
                    p2[0] += dist * -0.25;
                    break;
                case LiteGraph.RIGHT:
                    p2[0] += dist * 0.25;
                    break;
                case LiteGraph.UP:
                    p2[1] += dist * -0.25;
                    break;
                case LiteGraph.DOWN:
                    p2[1] += dist * 0.25;
                    break;
            }

            var c1 = (1 - t) * (1 - t) * (1 - t);
            var c2 = 3 * ((1 - t) * (1 - t)) * t;
            var c3 = 3 * (1 - t) * (t * t);
            var c4 = t * t * t;

            var x = c1 * p0[0] + c2 * p1[0] + c3 * p2[0] + c4 * p3[0];
            var y = c1 * p0[1] + c2 * p1[1] + c3 * p2[1] + c4 * p3[1];
            return [x, y];
        }
        drawExecutionOrder(ctx) {
            ctx.shadowColor = "transparent";
            ctx.globalAlpha = 0.25;

            ctx.textAlign = "center";
            ctx.strokeStyle = "white";
            ctx.globalAlpha = 0.75;

            var visible_nodes = this.visible_nodes;
            for (var i = 0; i < visible_nodes.length; ++i) {
                var node = visible_nodes[i];
                ctx.fillStyle = "black";
                ctx.fillRect(
                    node.pos[0] - LiteGraph.NODE_TITLE_HEIGHT,
                    node.pos[1] - LiteGraph.NODE_TITLE_HEIGHT,
                    LiteGraph.NODE_TITLE_HEIGHT,
                    LiteGraph.NODE_TITLE_HEIGHT
                );
                if (node.order == 0) {
                    ctx.strokeRect(
                        node.pos[0] - LiteGraph.NODE_TITLE_HEIGHT + 0.5,
                        node.pos[1] - LiteGraph.NODE_TITLE_HEIGHT + 0.5,
                        LiteGraph.NODE_TITLE_HEIGHT,
                        LiteGraph.NODE_TITLE_HEIGHT
                    );
                }
                ctx.fillStyle = "#FFF";
                ctx.fillText(
                    node.order,
                    node.pos[0] + LiteGraph.NODE_TITLE_HEIGHT * -0.5,
                    node.pos[1] - 6
                );
            }
            ctx.globalAlpha = 1;
        }
        /**
             * draws the widgets stored inside a node
             * @method drawNodeWidgets
             **/
        drawNodeWidgets(node,
            posY,
            ctx,
            active_widget) {
            if (!node.widgets || !node.widgets.length) {
                return 0;
            }
            var width = node.size[0];
            var widgets = node.widgets;
            posY += 2;
            var H = LiteGraph.NODE_WIDGET_HEIGHT;
            var show_text = this.ds.scale > 0.5;
            ctx.save();
            ctx.globalAlpha = this.editor_alpha;
            var outline_color = LiteGraph.WIDGET_OUTLINE_COLOR;
            var background_color = LiteGraph.WIDGET_BGCOLOR;
            var text_color = LiteGraph.WIDGET_TEXT_COLOR;
            var secondary_text_color = LiteGraph.WIDGET_SECONDARY_TEXT_COLOR;
            var margin = 15;

            for (var i = 0; i < widgets.length; ++i) {
                var w = widgets[i];
                var y = posY;
                if (w.y) {
                    y = w.y;
                }
                w.last_y = y;
                ctx.strokeStyle = outline_color;
                ctx.fillStyle = "#222";
                ctx.textAlign = "left";
                //ctx.lineWidth = 2;
                if (w.disabled)
                    ctx.globalAlpha *= 0.5;
                var widget_width = w.width || width;

                switch (w.type) {
                    case "button":
                        ctx.fillStyle = background_color;
                        if (w.clicked) {
                            ctx.fillStyle = "#AAA";
                            w.clicked = false;
                            this.dirty_canvas = true;
                        }
                        ctx.fillRect(margin, y, widget_width - margin * 2, H);
                        if (show_text && !w.disabled)
                            ctx.strokeRect(margin, y, widget_width - margin * 2, H);
                        if (show_text) {
                            ctx.textAlign = "center";
                            ctx.fillStyle = text_color;
                            ctx.fillText(w.label || w.name, widget_width * 0.5, y + H * 0.7);
                        }
                        break;
                    case "toggle":
                        ctx.textAlign = "left";
                        ctx.strokeStyle = outline_color;
                        ctx.fillStyle = background_color;
                        ctx.beginPath();
                        if (show_text)
                            ctx.roundRect(margin, y, widget_width - margin * 2, H, [H * 0.5]);

                        else
                            ctx.rect(margin, y, widget_width - margin * 2, H);
                        ctx.fill();
                        if (show_text && !w.disabled)
                            ctx.stroke();
                        ctx.fillStyle = w.value ? "#89A" : "#333";
                        ctx.beginPath();
                        ctx.arc(widget_width - margin * 2, y + H * 0.5, H * 0.36, 0, Math.PI * 2);
                        ctx.fill();
                        if (show_text) {
                            ctx.fillStyle = secondary_text_color;
                            const label = w.label || w.name;
                            if (label != null) {
                                ctx.fillText(label, margin * 2, y + H * 0.7);
                            }
                            ctx.fillStyle = w.value ? text_color : secondary_text_color;
                            ctx.textAlign = "right";
                            ctx.fillText(
                                w.value
                                    ? w.options.on || "true"
                                    : w.options.off || "false",
                                widget_width - 40,
                                y + H * 0.7
                            );
                        }
                        break;
                    case "slider":
                        ctx.fillStyle = background_color;
                        ctx.fillRect(margin, y, widget_width - margin * 2, H);
                        var range = w.options.max - w.options.min;
                        var nvalue = (w.value - w.options.min) / range;
                        if (nvalue < 0.0) nvalue = 0.0;
                        if (nvalue > 1.0) nvalue = 1.0;
                        ctx.fillStyle = w.options.hasOwnProperty("slider_color") ? w.options.slider_color : (active_widget == w ? "#89A" : "#678");
                        ctx.fillRect(margin, y, nvalue * (widget_width - margin * 2), H);
                        if (show_text && !w.disabled)
                            ctx.strokeRect(margin, y, widget_width - margin * 2, H);
                        if (w.marker) {
                            var marker_nvalue = (w.marker - w.options.min) / range;
                            if (marker_nvalue < 0.0) marker_nvalue = 0.0;
                            if (marker_nvalue > 1.0) marker_nvalue = 1.0;
                            ctx.fillStyle = w.options.hasOwnProperty("marker_color") ? w.options.marker_color : "#AA9";
                            ctx.fillRect(margin + marker_nvalue * (widget_width - margin * 2), y, 2, H);
                        }
                        if (show_text) {
                            ctx.textAlign = "center";
                            ctx.fillStyle = text_color;
                            ctx.fillText(
                                w.label || w.name + "  " + Number(w.value).toFixed(
                                    w.options.precision != null
                                        ? w.options.precision
                                        : 3
                                ),
                                widget_width * 0.5,
                                y + H * 0.7
                            );
                        }
                        break;
                    case "number":
                    case "combo":
                        ctx.textAlign = "left";
                        ctx.strokeStyle = outline_color;
                        ctx.fillStyle = background_color;
                        ctx.beginPath();
                        if (show_text)
                            ctx.roundRect(margin, y, widget_width - margin * 2, H, [H * 0.5]);

                        else
                            ctx.rect(margin, y, widget_width - margin * 2, H);
                        ctx.fill();
                        if (show_text) {
                            if (!w.disabled)
                                ctx.stroke();
                            ctx.fillStyle = text_color;
                            if (!w.disabled) {
                                ctx.beginPath();
                                ctx.moveTo(margin + 16, y + 5);
                                ctx.lineTo(margin + 6, y + H * 0.5);
                                ctx.lineTo(margin + 16, y + H - 5);
                                ctx.fill();
                                ctx.beginPath();
                                ctx.moveTo(widget_width - margin - 16, y + 5);
                                ctx.lineTo(widget_width - margin - 6, y + H * 0.5);
                                ctx.lineTo(widget_width - margin - 16, y + H - 5);
                                ctx.fill();
                            }
                            ctx.fillStyle = secondary_text_color;
                            ctx.fillText(w.label || w.name, margin * 2 + 5, y + H * 0.7);
                            ctx.fillStyle = text_color;
                            ctx.textAlign = "right";
                            if (w.type == "number") {
                                ctx.fillText(
                                    Number(w.value).toFixed(
                                        w.options.precision !== undefined
                                            ? w.options.precision
                                            : 3
                                    ),
                                    widget_width - margin * 2 - 20,
                                    y + H * 0.7
                                );
                            } else {
                                var v = w.value;
                                if (w.options.values) {
                                    var values = w.options.values;
                                    if (values.constructor === Function)
                                        values = values();
                                    if (values && values.constructor !== Array)
                                        v = values[w.value];
                                }
                                const labelWidth = ctx.measureText(w.label || w.name).width + margin * 2;
                                const inputWidth = widget_width - margin * 4;
                                const availableWidth = inputWidth - labelWidth;
                                const textWidth = ctx.measureText(v).width;
                                if (textWidth > availableWidth) {
                                    const ELLIPSIS = "\u2026";
                                    const ellipsisWidth = ctx.measureText(ELLIPSIS).width;
                                    const charWidthAvg = ctx.measureText("a").width;
                                    if (availableWidth <= ellipsisWidth) {
                                        v = "\u2024"; // One dot leader
                                    } else {
                                        v = `${v}`
                                        const overflowWidth = (textWidth + ellipsisWidth) - availableWidth;
                                        // Only first 3 characters need to be measured precisely
                                        if (overflowWidth + charWidthAvg * 3 > availableWidth) {
                                            const preciseRange = availableWidth + charWidthAvg * 3;
                                            const preTruncateCt = Math.floor((preciseRange - ellipsisWidth) / charWidthAvg);
                                            v = v.substr(0, preTruncateCt);
                                        }
                                        while (ctx.measureText(v).width + ellipsisWidth > availableWidth) {
                                            v = v.substr(0, v.length - 1);
                                        }
                                        v += ELLIPSIS;
                                    }
                                }
                                ctx.fillText(
                                    v,
                                    widget_width - margin * 2 - 20,
                                    y + H * 0.7
                                );
                            }
                        }
                        break;
                    case "string":
                    case "text":
                        ctx.textAlign = "left";
                        ctx.strokeStyle = outline_color;
                        ctx.fillStyle = background_color;
                        ctx.beginPath();
                        if (show_text)
                            ctx.roundRect(margin, y, widget_width - margin * 2, H, [H * 0.5]);

                        else
                            ctx.rect(margin, y, widget_width - margin * 2, H);
                        ctx.fill();
                        if (show_text) {
                            if (!w.disabled)
                                ctx.stroke();
                            ctx.save();
                            ctx.beginPath();
                            ctx.rect(margin, y, widget_width - margin * 2, H);
                            ctx.clip();

                            //ctx.stroke();
                            ctx.fillStyle = secondary_text_color;
                            const label = w.label || w.name;
                            if (label != null) {
                                ctx.fillText(label, margin * 2, y + H * 0.7);
                            }
                            ctx.fillStyle = text_color;
                            ctx.textAlign = "right";
                            ctx.fillText(String(w.value).substr(0, 30), widget_width - margin * 2, y + H * 0.7); //30 chars max
                            ctx.restore();
                        }
                        break;
                    default:
                        if (w.draw) {
                            w.draw(ctx, node, widget_width, y, H);
                        }
                        break;
                }
                posY += (w.computeSize ? w.computeSize(widget_width)[1] : H) + 4;
                ctx.globalAlpha = this.editor_alpha;

            }
            ctx.restore();
            ctx.textAlign = "left";
        }
        /**
             * process an event on widgets
             * @method processNodeWidgets
             **/
        processNodeWidgets(node,
            pos,
            event,
            active_widget) {
            if (!node.widgets || !node.widgets.length || (!this.allow_interaction && !node.flags.allow_interaction)) {
                return null;
            }

            var x = pos[0] - node.pos[0];
            var y = pos[1] - node.pos[1];
            var width = node.size[0];
            var that = this;
            var ref_window = this.getCanvasWindow();

            for (var i = 0; i < node.widgets.length; ++i) {
                var w = node.widgets[i];
                if (!w || w.disabled)
                    continue;
                var widget_height = w.computeSize ? w.computeSize(width)[1] : LiteGraph.NODE_WIDGET_HEIGHT;
                var widget_width = w.width || width;
                //outside
                if (w != active_widget &&
                    (x < 6 || x > widget_width - 12 || y < w.last_y || y > w.last_y + widget_height || w.last_y === undefined))
                    continue;

                var old_value = w.value;

                //if ( w == active_widget || (x > 6 && x < widget_width - 12 && y > w.last_y && y < w.last_y + widget_height) ) {
                //inside widget
                switch (w.type) {
                    case "button":
                        if (event.type === LiteGraph.pointerevents_method + "down") {
                            if (w.callback) {
                                setTimeout(function () {
                                    w.callback(w, that, node, pos, event);
                                }, 20);
                            }
                            w.clicked = true;
                            this.dirty_canvas = true;
                        }
                        break;
                    case "slider":
                        var old_value = w.value;
                        var nvalue = clamp((x - 15) / (widget_width - 30), 0, 1);
                        if (w.options.read_only) break;
                        w.value = w.options.min + (w.options.max - w.options.min) * nvalue;
                        if (old_value != w.value) {
                            setTimeout(function () {
                                inner_value_change(w, w.value);
                            }, 20);
                        }
                        this.dirty_canvas = true;
                        break;
                    case "number":
                    case "combo":
                        var old_value = w.value;
                        var delta = x < 40 ? -1 : x > widget_width - 40 ? 1 : 0;
                        var allow_scroll = true;
                        if (delta) {
                            if (x > -3 && x < widget_width + 3) {
                                allow_scroll = false;
                            }
                        }
                        if (allow_scroll && event.type == LiteGraph.pointerevents_method + "move" && w.type == "number") {
                            if (event.deltaX)
                                w.value += event.deltaX * 0.1 * (w.options.step || 1);
                            if (w.options.min != null && w.value < w.options.min) {
                                w.value = w.options.min;
                            }
                            if (w.options.max != null && w.value > w.options.max) {
                                w.value = w.options.max;
                            }
                        } else if (event.type == LiteGraph.pointerevents_method + "down") {
                            var values = w.options.values;
                            if (values && values.constructor === Function) {
                                values = w.options.values(w, node);
                            }
                            var values_list = null;

                            if (w.type != "number")
                                values_list = values.constructor === Array ? values : Object.keys(values);

                            var delta = x < 40 ? -1 : x > widget_width - 40 ? 1 : 0;
                            if (w.type == "number") {
                                w.value += delta * 0.1 * (w.options.step || 1);
                                if (w.options.min != null && w.value < w.options.min) {
                                    w.value = w.options.min;
                                }
                                if (w.options.max != null && w.value > w.options.max) {
                                    w.value = w.options.max;
                                }
                            } else if (delta) { //clicked in arrow, used for combos 
                                var index = -1;
                                this.last_mouseclick = 0; //avoids dobl click event
                                if (values.constructor === Object)
                                    index = values_list.indexOf(String(w.value)) + delta;

                                else
                                    index = values_list.indexOf(w.value) + delta;
                                if (index >= values_list.length) {
                                    index = values_list.length - 1;
                                }
                                if (index < 0) {
                                    index = 0;
                                }
                                if (values.constructor === Array)
                                    w.value = values[index];

                                else
                                    w.value = index;
                            } else { //combo clicked 
                                var text_values = values != values_list ? Object.values(values) : values;
                                var menu = new LiteGraph.ContextMenu(text_values, {
                                    scale: Math.max(1, this.ds.scale),
                                    event: event,
                                    className: "dark",
                                    callback: inner_clicked.bind(w)
                                },
                                    ref_window);
                                function inner_clicked(v, option, event) {
                                    if (values != values_list)
                                        v = text_values.indexOf(v);
                                    this.value = v;
                                    inner_value_change(this, v);
                                    that.dirty_canvas = true;
                                    return false;
                                }
                            }
                        } //end mousedown
                        else if (event.type == LiteGraph.pointerevents_method + "up" && w.type == "number") {
                            var delta = x < 40 ? -1 : x > widget_width - 40 ? 1 : 0;
                            if (event.click_time < 200 && delta == 0) {
                                this.prompt("Value", w.value, function (v) {
                                    // check if v is a valid equation or a number
                                    if (/^[0-9+\-*/()\s]+|\d+\.\d+$/.test(v)) {
                                        try { //solve the equation if possible
                                            v = eval(v);
                                        } catch (e) { }
                                    }
                                    this.value = Number(v);
                                    inner_value_change(this, this.value);
                                }.bind(w),
                                    event);
                            }
                        }

                        if (old_value != w.value)
                            setTimeout(
                                function () {
                                    inner_value_change(this, this.value);
                                }.bind(w),
                                20
                            );
                        this.dirty_canvas = true;
                        break;
                    case "toggle":
                        if (event.type == LiteGraph.pointerevents_method + "down") {
                            w.value = !w.value;
                            setTimeout(function () {
                                inner_value_change(w, w.value);
                            }, 20);
                        }
                        break;
                    case "string":
                    case "text":
                        if (event.type == LiteGraph.pointerevents_method + "down") {
                            this.prompt("Value", w.value, function (v) {
                                inner_value_change(this, v);
                            }.bind(w),
                                event, w.options ? w.options.multiline : false);
                        }
                        break;
                    default:
                        if (w.mouse) {
                            this.dirty_canvas = w.mouse(event, [x, y], node);
                        }
                        break;
                } //end switch


                //value changed
                if (old_value != w.value) {
                    if (node.onWidgetChanged)
                        node.onWidgetChanged(w.name, w.value, old_value, w);
                    node.graph._version++;
                }

                return w;
            } //end for

            function inner_value_change(widget, value) {
                if (widget.type == "number") {
                    value = Number(value);
                }
                widget.value = value;
                if (widget.options && widget.options.property && node.properties[widget.options.property] !== undefined) {
                    node.setProperty(widget.options.property, value);
                }
                if (widget.callback) {
                    widget.callback(widget.value, that, node, pos, event);
                }
            }

            return null;
        }
        /**
         * draws every group area in the background
         * @method drawGroups
         **/
        drawGroups(canvas, ctx) {
            if (!this.graph) {
                return;
            }

            var groups = this.graph._groups;

            ctx.save();
            ctx.globalAlpha = 0.5 * this.editor_alpha;

            for (var i = 0; i < groups.length; ++i) {
                var group = groups[i];

                if (!overlapBounding(this.visible_area, group._bounding)) {
                    continue;
                } //out of the visible area

                group.draw(this, ctx);
            }

            ctx.restore();
        }
        adjustNodesSize() {
            var nodes = this.graph._nodes;
            for (var i = 0; i < nodes.length; ++i) {
                nodes[i].size = nodes[i].computeSize();
            }
            this.setDirty(true, true);
        }
        /**
             * resizes the canvas to a given size, if no size is passed, then it tries to fill the parentNode
             * @method resize
             **/
        resize(width, height) {
            if (!width && !height) {
                var parent = this.canvas.parentNode;
                width = parent.offsetWidth;
                height = parent.offsetHeight;
            }

            if (this.canvas.width == width && this.canvas.height == height) {
                return;
            }

            this.canvas.width = width;
            this.canvas.height = height;
            this.bgcanvas.width = this.canvas.width;
            this.bgcanvas.height = this.canvas.height;
            this.setDirty(true, true);
        }
        /**
             * switches to live mode (node shapes are not rendered, only the content)
             * this feature was designed when graphs where meant to create user interfaces
             * @method switchLiveMode
             **/
        switchLiveMode(transition) {
            if (!transition) {
                this.live_mode = !this.live_mode;
                this.dirty_canvas = true;
                this.dirty_bgcanvas = true;
                return;
            }

            var self = this;
            var delta = this.live_mode ? 1.1 : 0.9;
            if (this.live_mode) {
                this.live_mode = false;
                this.editor_alpha = 0.1;
            }

            var t = setInterval(function () {
                self.editor_alpha *= delta;
                self.dirty_canvas = true;
                self.dirty_bgcanvas = true;

                if (delta < 1 && self.editor_alpha < 0.01) {
                    clearInterval(t);
                    if (delta < 1) {
                        self.live_mode = true;
                    }
                }
                if (delta > 1 && self.editor_alpha > 0.99) {
                    clearInterval(t);
                    self.editor_alpha = 1;
                }
            }, 1);
        }
        onNodeSelectionChange(node) {
            return; //disabled
        }
        /**
             * Determines the furthest nodes in each direction for the currently selected nodes
             * @return {{left: LGraphNode, top: LGraphNode, right: LGraphNode, bottom: LGraphNode}}
             */
        boundaryNodesForSelection() {
            return LGraphCanvas.getBoundaryNodes(Object.values(this.selected_nodes));
        }
        showLinkMenu(link, e) {
            var that = this;
            // console.log(link);
            var node_left = that.graph.getNodeById(link.origin_id);
            var node_right = that.graph.getNodeById(link.target_id);
            var fromType = false;
            if (node_left && node_left.outputs && node_left.outputs[link.origin_slot]) fromType = node_left.outputs[link.origin_slot].type;
            var destType = false;
            if (node_right && node_right.outputs && node_right.outputs[link.target_slot]) destType = node_right.inputs[link.target_slot].type;

            var options = ["Add Node", null, "Delete", null];


            var menu = new LiteGraph.ContextMenu(options, {
                event: e,
                title: link.data != null ? link.data.constructor.name : null,
                callback: inner_clicked
            });

            function inner_clicked(v, options, e) {
                switch (v) {
                    case "Add Node":
                        LGraphCanvas.onMenuAdd(null, null, e, menu, function (node) {
                            // console.debug("node autoconnect");
                            if (!node.inputs || !node.inputs.length || !node.outputs || !node.outputs.length) {
                                return;
                            }
                            // leave the connection type checking inside connectByType
                            if (node_left.connectByType(link.origin_slot, node, fromType)) {
                                node.connectByType(link.target_slot, node_right, destType);
                                node.pos[0] -= node.size[0] * 0.5;
                            }
                        });
                        break;

                    case "Delete":
                        that.graph.removeLink(link.id);
                        break;
                    default:
                    /*var nodeCreated = createDefaultNodeForSlot({   nodeFrom: node_left
                                                                    ,slotFrom: link.origin_slot
                                                                    ,nodeTo: node
                                                                    ,slotTo: link.target_slot
                                                                    ,e: e
                                                                    ,nodeType: "AUTO"
                                                                });
                    if(nodeCreated) console.log("new node in beetween "+v+" created");*/
                }
            }

            return false;
        }
        createDefaultNodeForSlot(optPass) {
            var optPass = optPass || {};
            var opts = Object.assign({
                nodeFrom: null // input
                ,
                slotFrom: null // input
                ,
                nodeTo: null // output
                ,
                slotTo: null // output
                ,
                position: [] // pass the event coords
                ,
                nodeType: null // choose a nodetype to add, AUTO to set at first good
                ,
                posAdd: [0, 0] // adjust x,y
                ,
                posSizeFix: [0, 0] // alpha, adjust the position x,y based on the new node size w,h
            },
                optPass
            );
            var that = this;

            var isFrom = opts.nodeFrom && opts.slotFrom !== null;
            var isTo = !isFrom && opts.nodeTo && opts.slotTo !== null;

            if (!isFrom && !isTo) {
                console.warn("No data passed to createDefaultNodeForSlot " + opts.nodeFrom + " " + opts.slotFrom + " " + opts.nodeTo + " " + opts.slotTo);
                return false;
            }
            if (!opts.nodeType) {
                console.warn("No type to createDefaultNodeForSlot");
                return false;
            }

            var nodeX = isFrom ? opts.nodeFrom : opts.nodeTo;
            var slotX = isFrom ? opts.slotFrom : opts.slotTo;

            var iSlotConn = false;
            switch (typeof slotX) {
                case "string":
                    iSlotConn = isFrom ? nodeX.findOutputSlot(slotX, false) : nodeX.findInputSlot(slotX, false);
                    slotX = isFrom ? nodeX.outputs[slotX] : nodeX.inputs[slotX];
                    break;
                case "object":
                    // ok slotX
                    iSlotConn = isFrom ? nodeX.findOutputSlot(slotX.name) : nodeX.findInputSlot(slotX.name);
                    break;
                case "number":
                    iSlotConn = slotX;
                    slotX = isFrom ? nodeX.outputs[slotX] : nodeX.inputs[slotX];
                    break;
                case "undefined":
                default:
                    // bad ?
                    //iSlotConn = 0;
                    console.warn("Cant get slot information " + slotX);
                    return false;
            }

            if (slotX === false || iSlotConn === false) {
                console.warn("createDefaultNodeForSlot bad slotX " + slotX + " " + iSlotConn);
            }

            // check for defaults nodes for this slottype
            var fromSlotType = slotX.type == LiteGraph.EVENT ? "_event_" : slotX.type;
            var slotTypesDefault = isFrom ? LiteGraph.slot_types_default_out : LiteGraph.slot_types_default_in;
            if (slotTypesDefault && slotTypesDefault[fromSlotType]) {
                if (slotX.link !== null) {
                    // is connected
                } else {
                    // is not not connected
                }
                let nodeNewType = false;
                if (typeof slotTypesDefault[fromSlotType] == "object" || typeof slotTypesDefault[fromSlotType] == "array") {
                    for (var typeX in slotTypesDefault[fromSlotType]) {
                        if (opts.nodeType == slotTypesDefault[fromSlotType][typeX] || opts.nodeType == "AUTO") {
                            nodeNewType = slotTypesDefault[fromSlotType][typeX];
                            // console.log("opts.nodeType == slotTypesDefault[fromSlotType][typeX] :: "+opts.nodeType);
                            break; // --------
                        }
                    }
                } else {
                    if (opts.nodeType == slotTypesDefault[fromSlotType] || opts.nodeType == "AUTO") nodeNewType = slotTypesDefault[fromSlotType];
                }
                if (nodeNewType) {
                    var nodeNewOpts = false;
                    if (typeof nodeNewType == "object" && nodeNewType.node) {
                        nodeNewOpts = nodeNewType;
                        nodeNewType = nodeNewType.node;
                    }

                    //that.graph.beforeChange();
                    var newNode = LiteGraph.createNode(nodeNewType);
                    if (newNode) {
                        // if is object pass options
                        if (nodeNewOpts) {
                            if (nodeNewOpts.properties) {
                                for (var i in nodeNewOpts.properties) {
                                    newNode.addProperty(i, nodeNewOpts.properties[i]);
                                }
                            }
                            if (nodeNewOpts.inputs) {
                                newNode.inputs = [];
                                for (var i in nodeNewOpts.inputs) {
                                    newNode.addOutput(
                                        nodeNewOpts.inputs[i][0],
                                        nodeNewOpts.inputs[i][1]
                                    );
                                }
                            }
                            if (nodeNewOpts.outputs) {
                                newNode.outputs = [];
                                for (var i in nodeNewOpts.outputs) {
                                    newNode.addOutput(
                                        nodeNewOpts.outputs[i][0],
                                        nodeNewOpts.outputs[i][1]
                                    );
                                }
                            }
                            if (nodeNewOpts.title) {
                                newNode.title = nodeNewOpts.title;
                            }
                            if (nodeNewOpts.json) {
                                newNode.configure(nodeNewOpts.json);
                            }

                        }

                        // add the node
                        that.graph.add(newNode);
                        newNode.pos = [opts.position[0] + opts.posAdd[0] + (opts.posSizeFix[0] ? opts.posSizeFix[0] * newNode.size[0] : 0),
                        opts.position[1] + opts.posAdd[1] + (opts.posSizeFix[1] ? opts.posSizeFix[1] * newNode.size[1] : 0)]; //that.last_click_position; //[e.canvasX+30, e.canvasX+5];*/




                        //that.graph.afterChange();
                        // connect the two!
                        if (isFrom) {
                            opts.nodeFrom.connectByType(iSlotConn, newNode, fromSlotType);
                        } else {
                            opts.nodeTo.connectByTypeOutput(iSlotConn, newNode, fromSlotType);
                        }

                        // if connecting in between
                        if (isFrom && isTo) {
                            // TODO
                        }

                        return true;

                    } else {
                        console.log("failed creating " + nodeNewType);
                    }
                }
            }
            return false;
        }
        showConnectionMenu(optPass) {
            var optPass = optPass || {};
            var opts = Object.assign({
                nodeFrom: null // input
                ,
                slotFrom: null // input
                ,
                nodeTo: null // output
                ,
                slotTo: null // output
                ,
                e: null,
                allow_searchbox: this.allow_searchbox,
                showSearchBox: this.showSearchBox,
            },
                optPass
            );
            var that = this;

            var isFrom = opts.nodeFrom && opts.slotFrom;
            var isTo = !isFrom && opts.nodeTo && opts.slotTo;

            if (!isFrom && !isTo) {
                console.warn("No data passed to showConnectionMenu");
                return;
            }

            var nodeX = isFrom ? opts.nodeFrom : opts.nodeTo;
            var slotX = isFrom ? opts.slotFrom : opts.slotTo;

            var iSlotConn = false;
            switch (typeof slotX) {
                case "string":
                    iSlotConn = isFrom ? nodeX.findOutputSlot(slotX, false) : nodeX.findInputSlot(slotX, false);
                    slotX = isFrom ? nodeX.outputs[slotX] : nodeX.inputs[slotX];
                    break;
                case "object":
                    // ok slotX
                    iSlotConn = isFrom ? nodeX.findOutputSlot(slotX.name) : nodeX.findInputSlot(slotX.name);
                    break;
                case "number":
                    iSlotConn = slotX;
                    slotX = isFrom ? nodeX.outputs[slotX] : nodeX.inputs[slotX];
                    break;
                default:
                    // bad ?
                    //iSlotConn = 0;
                    console.warn("Cant get slot information " + slotX);
                    return;
            }

            var options = ["Add Node", null];

            if (opts.allow_searchbox) {
                options.push("Search");
                options.push(null);
            }

            // get defaults nodes for this slottype
            var fromSlotType = slotX.type == LiteGraph.EVENT ? "_event_" : slotX.type;
            var slotTypesDefault = isFrom ? LiteGraph.slot_types_default_out : LiteGraph.slot_types_default_in;
            if (slotTypesDefault && slotTypesDefault[fromSlotType]) {
                if (typeof slotTypesDefault[fromSlotType] == "object" || typeof slotTypesDefault[fromSlotType] == "array") {
                    for (var typeX in slotTypesDefault[fromSlotType]) {
                        options.push(slotTypesDefault[fromSlotType][typeX]);
                    }
                } else {
                    options.push(slotTypesDefault[fromSlotType]);
                }
            }

            // build menu
            var menu = new LiteGraph.ContextMenu(options, {
                event: opts.e,
                title: (slotX && slotX.name != "" ? (slotX.name + (fromSlotType ? " | " : "")) : "") + (slotX && fromSlotType ? fromSlotType : ""),
                callback: inner_clicked
            });

            // callback
            function inner_clicked(v, options, e) {
                //console.log("Process showConnectionMenu selection");
                switch (v) {
                    case "Add Node":
                        LGraphCanvas.onMenuAdd(null, null, e, menu, function (node) {
                            if (isFrom) {
                                opts.nodeFrom.connectByType(iSlotConn, node, fromSlotType);
                            } else {
                                opts.nodeTo.connectByTypeOutput(iSlotConn, node, fromSlotType);
                            }
                        });
                        break;
                    case "Search":
                        if (isFrom) {
                            opts.showSearchBox(e, { node_from: opts.nodeFrom, slot_from: slotX, type_filter_in: fromSlotType });
                        } else {
                            opts.showSearchBox(e, { node_to: opts.nodeTo, slot_from: slotX, type_filter_out: fromSlotType });
                        }
                        break;
                    default:
                        // check for defaults nodes for this slottype
                        var nodeCreated = that.createDefaultNodeForSlot(Object.assign(opts, {
                            position: [opts.e.canvasX, opts.e.canvasY],
                            nodeType: v
                        }));
                        if (nodeCreated) {
                            // new node created
                            //console.log("node "+v+" created")
                        } else {
                            // failed or v is not in defaults
                        }
                        break;
                }
            }
        }
        // refactor: there are different dialogs, some uses createDialog some dont
        prompt(title, value, callback, event, multiline) {
            var that = this;
            var input_html = "";
            title = title || "";

            var dialog = document.createElement("div");
            dialog.is_modified = false;
            dialog.className = "graphdialog rounded";
            if (multiline)
                dialog.innerHTML = "<span class='name'></span> <textarea autofocus class='value'></textarea><button class='rounded'>OK</button>";

            else
                dialog.innerHTML = "<span class='name'></span> <input autofocus type='text' class='value'/><button class='rounded'>OK</button>";
            dialog.close = function () {
                that.prompt_box = null;
                if (dialog.parentNode) {
                    dialog.parentNode.removeChild(dialog);
                }
            };

            var graphcanvas = LGraphCanvas.active_canvas;
            var canvas = graphcanvas.canvas;
            canvas.parentNode.appendChild(dialog);

            if (this.ds.scale > 1) {
                dialog.style.transform = "scale(" + this.ds.scale + ")";
            }

            var dialogCloseTimer = null;
            var prevent_timeout = false;
            LiteGraph.pointerListenerAdd(dialog, "leave", function (e) {
                if (prevent_timeout)
                    return;
                if (LiteGraph.dialog_close_on_mouse_leave)
                    if (!dialog.is_modified && LiteGraph.dialog_close_on_mouse_leave)
                        dialogCloseTimer = setTimeout(dialog.close, LiteGraph.dialog_close_on_mouse_leave_delay); //dialog.close();
            });
            LiteGraph.pointerListenerAdd(dialog, "enter", function (e) {
                if (LiteGraph.dialog_close_on_mouse_leave)
                    if (dialogCloseTimer) clearTimeout(dialogCloseTimer);
            });
            var selInDia = dialog.querySelectorAll("select");
            if (selInDia) {
                // if filtering, check focus changed to comboboxes and prevent closing
                selInDia.forEach(function (selIn) {
                    selIn.addEventListener("click", function (e) {
                        prevent_timeout++;
                    });
                    selIn.addEventListener("blur", function (e) {
                        prevent_timeout = 0;
                    });
                    selIn.addEventListener("change", function (e) {
                        prevent_timeout = -1;
                    });
                });
            }

            if (that.prompt_box) {
                that.prompt_box.close();
            }
            that.prompt_box = dialog;

            var first = null;
            var timeout = null;
            var selected = null;

            var name_element = dialog.querySelector(".name");
            name_element.innerText = title;
            var value_element = dialog.querySelector(".value");
            value_element.value = value;
            value_element.select();

            var input = value_element;
            input.addEventListener("keydown", function (e) {
                dialog.is_modified = true;
                if (e.keyCode == 27) {
                    //ESC
                    dialog.close();
                } else if (e.keyCode == 13 && e.target.localName != "textarea") {
                    if (callback) {
                        callback(this.value);
                    }
                    dialog.close();
                } else {
                    return;
                }
                e.preventDefault();
                e.stopPropagation();
            });

            var button = dialog.querySelector("button");
            button.addEventListener("click", function (e) {
                if (callback) {
                    callback(input.value);
                }
                that.setDirty(true);
                dialog.close();
            });

            var rect = canvas.getBoundingClientRect();
            var offsetx = -20;
            var offsety = -20;
            if (rect) {
                offsetx -= rect.left;
                offsety -= rect.top;
            }

            if (event) {
                dialog.style.left = event.clientX + offsetx + "px";
                dialog.style.top = event.clientY + offsety + "px";
            } else {
                dialog.style.left = canvas.width * 0.5 + offsetx + "px";
                dialog.style.top = canvas.height * 0.5 + offsety + "px";
            }

            setTimeout(function () {
                input.focus();
                const clickTime = Date.now();
                function handleOutsideClick(e) {
                    if (e.target === canvas && Date.now() - clickTime > 256) {
                        dialog.close();
                        canvas.parentNode.removeEventListener("click", handleOutsideClick);
                        canvas.parentNode.removeEventListener("touchend", handleOutsideClick);
                    }
                }
                canvas.parentNode.addEventListener("click", handleOutsideClick);
                canvas.parentNode.addEventListener("touchend", handleOutsideClick);
            }, 10);

            return dialog;
        }
        showSearchBox(event, options) {
            // proposed defaults
            var def_options = {
                slot_from: null,
                node_from: null,
                node_to: null,
                do_type_filter: LiteGraph.search_filter_enabled // TODO check for registered_slot_[in/out]_types not empty // this will be checked for functionality enabled : filter on slot type, in and out
                ,
                type_filter_in: false // these are default: pass to set initially set values
                ,
                type_filter_out: false,
                show_general_if_none_on_typefilter: true,
                show_general_after_typefiltered: true,
                hide_on_mouse_leave: LiteGraph.search_hide_on_mouse_leave,
                show_all_if_empty: true,
                show_all_on_open: LiteGraph.search_show_all_on_open
            };
            options = Object.assign(def_options, options || {});

            //console.log(options);
            var that = this;
            var input_html = "";
            var graphcanvas = LGraphCanvas.active_canvas;
            var canvas = graphcanvas.canvas;
            var root_document = canvas.ownerDocument || document;

            var dialog = document.createElement("div");
            dialog.className = "litegraph litesearchbox graphdialog rounded";
            dialog.innerHTML = "<span class='name'>Search</span> <input autofocus type='text' class='value rounded'/>";
            if (options.do_type_filter) {
                dialog.innerHTML += "<select class='slot_in_type_filter'><option value=''></option></select>";
                dialog.innerHTML += "<select class='slot_out_type_filter'><option value=''></option></select>";
            }
            dialog.innerHTML += "<div class='helper'></div>";

            if (root_document.fullscreenElement)
                root_document.fullscreenElement.appendChild(dialog);

            else {
                root_document.body.appendChild(dialog);
                root_document.body.style.overflow = "hidden";
            }
            // dialog element has been appended
            if (options.do_type_filter) {
                var selIn = dialog.querySelector(".slot_in_type_filter");
                var selOut = dialog.querySelector(".slot_out_type_filter");
            }

            dialog.close = function () {
                that.search_box = null;
                this.blur();
                canvas.focus();
                root_document.body.style.overflow = "";

                setTimeout(function () {
                    that.canvas.focus();
                }, 20); //important, if canvas loses focus keys wont be captured
                if (dialog.parentNode) {
                    dialog.parentNode.removeChild(dialog);
                }
            };

            if (this.ds.scale > 1) {
                dialog.style.transform = "scale(" + this.ds.scale + ")";
            }

            // hide on mouse leave
            if (options.hide_on_mouse_leave) {
                var prevent_timeout = false;
                var timeout_close = null;
                LiteGraph.pointerListenerAdd(dialog, "enter", function (e) {
                    if (timeout_close) {
                        clearTimeout(timeout_close);
                        timeout_close = null;
                    }
                });
                LiteGraph.pointerListenerAdd(dialog, "leave", function (e) {
                    if (prevent_timeout) {
                        return;
                    }
                    timeout_close = setTimeout(function () {
                        dialog.close();
                    }, typeof options.hide_on_mouse_leave === "number" ? options.hide_on_mouse_leave : 500);
                });
                // if filtering, check focus changed to comboboxes and prevent closing
                if (options.do_type_filter) {
                    selIn.addEventListener("click", function (e) {
                        prevent_timeout++;
                    });
                    selIn.addEventListener("blur", function (e) {
                        prevent_timeout = 0;
                    });
                    selIn.addEventListener("change", function (e) {
                        prevent_timeout = -1;
                    });
                    selOut.addEventListener("click", function (e) {
                        prevent_timeout++;
                    });
                    selOut.addEventListener("blur", function (e) {
                        prevent_timeout = 0;
                    });
                    selOut.addEventListener("change", function (e) {
                        prevent_timeout = -1;
                    });
                }
            }

            if (that.search_box) {
                that.search_box.close();
            }
            that.search_box = dialog;

            var helper = dialog.querySelector(".helper");

            var first = null;
            var timeout = null;
            var selected = null;

            var input = dialog.querySelector("input");
            if (input) {
                input.addEventListener("blur", function (e) {
                    this.focus();
                });
                input.addEventListener("keydown", function (e) {
                    if (e.keyCode == 38) {
                        //UP
                        changeSelection(false);
                    } else if (e.keyCode == 40) {
                        //DOWN
                        changeSelection(true);
                    } else if (e.keyCode == 27) {
                        //ESC
                        dialog.close();
                    } else if (e.keyCode == 13) {
                        if (selected) {
                            select(unescape(selected.dataset["type"]));
                        } else if (first) {
                            select(first);
                        } else {
                            dialog.close();
                        }
                    } else {
                        if (timeout) {
                            clearInterval(timeout);
                        }
                        timeout = setTimeout(refreshHelper, 10);
                        return;
                    }
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    return true;
                });
            }

            // if should filter on type, load and fill selected and choose elements if passed
            if (options.do_type_filter) {
                if (selIn) {
                    var aSlots = LiteGraph.slot_types_in;
                    var nSlots = aSlots.length; // this for object :: Object.keys(aSlots).length;

                    if (options.type_filter_in == LiteGraph.EVENT || options.type_filter_in == LiteGraph.ACTION)
                        options.type_filter_in = "_event_";
                    /* this will filter on * .. but better do it manually in case
                    else if(options.type_filter_in === "" || options.type_filter_in === 0)
                        options.type_filter_in = "*";*/
                    for (var iK = 0; iK < nSlots; iK++) {
                        var opt = document.createElement('option');
                        opt.value = aSlots[iK];
                        opt.innerHTML = aSlots[iK];
                        selIn.appendChild(opt);
                        if (options.type_filter_in !== false && (options.type_filter_in + "").toLowerCase() == (aSlots[iK] + "").toLowerCase()) {
                            //selIn.selectedIndex ..
                            opt.selected = true;
                            //console.log("comparing IN "+options.type_filter_in+" :: "+aSlots[iK]);
                        } else {
                            //console.log("comparing OUT "+options.type_filter_in+" :: "+aSlots[iK]);
                        }
                    }
                    selIn.addEventListener("change", function () {
                        refreshHelper();
                    });
                }
                if (selOut) {
                    var aSlots = LiteGraph.slot_types_out;
                    var nSlots = aSlots.length; // this for object :: Object.keys(aSlots).length; 

                    if (options.type_filter_out == LiteGraph.EVENT || options.type_filter_out == LiteGraph.ACTION)
                        options.type_filter_out = "_event_";
                    /* this will filter on * .. but better do it manually in case
                    else if(options.type_filter_out === "" || options.type_filter_out === 0)
                        options.type_filter_out = "*";*/
                    for (var iK = 0; iK < nSlots; iK++) {
                        var opt = document.createElement('option');
                        opt.value = aSlots[iK];
                        opt.innerHTML = aSlots[iK];
                        selOut.appendChild(opt);
                        if (options.type_filter_out !== false && (options.type_filter_out + "").toLowerCase() == (aSlots[iK] + "").toLowerCase()) {
                            //selOut.selectedIndex ..
                            opt.selected = true;
                        }
                    }
                    selOut.addEventListener("change", function () {
                        refreshHelper();
                    });
                }
            }

            //compute best position
            var rect = canvas.getBoundingClientRect();

            var left = (event ? event.clientX : (rect.left + rect.width * 0.5)) - 80;
            var top = (event ? event.clientY : (rect.top + rect.height * 0.5)) - 20;
            dialog.style.left = left + "px";
            dialog.style.top = top + "px";

            //To avoid out of screen problems
            if (event.layerY > (rect.height - 200))
                helper.style.maxHeight = (rect.height - event.layerY - 20) + "px";

            /*
            var offsetx = -20;
            var offsety = -20;
            if (rect) {
                offsetx -= rect.left;
                offsety -= rect.top;
            }
    
            if (event) {
                dialog.style.left = event.clientX + offsetx + "px";
                dialog.style.top = event.clientY + offsety + "px";
            } else {
                dialog.style.left = canvas.width * 0.5 + offsetx + "px";
                dialog.style.top = canvas.height * 0.5 + offsety + "px";
            }
            canvas.parentNode.appendChild(dialog);
            */
            requestAnimationFrame(function () {
              input.focus();
            });
            if (options.show_all_on_open) refreshHelper();

            function select(name) {
                if (name) {
                    if (that.onSearchBoxSelection) {
                        that.onSearchBoxSelection(name, event, graphcanvas);
                    } else {
                        var extra = LiteGraph.searchbox_extras[name.toLowerCase()];
                        if (extra) {
                            name = extra.type;
                        }

                        graphcanvas.graph.beforeChange();
                        var node = LiteGraph.createNode(name);
                        if (node) {
                            node.pos = graphcanvas.convertEventToCanvasOffset(
                                event
                            );
                            graphcanvas.graph.add(node, false);
                        }

                        if (extra && extra.data) {
                            if (extra.data.properties) {
                                for (var i in extra.data.properties) {
                                    node.addProperty(i, extra.data.properties[i]);
                                }
                            }
                            if (extra.data.inputs) {
                                node.inputs = [];
                                for (var i in extra.data.inputs) {
                                    node.addOutput(
                                        extra.data.inputs[i][0],
                                        extra.data.inputs[i][1]
                                    );
                                }
                            }
                            if (extra.data.outputs) {
                                node.outputs = [];
                                for (var i in extra.data.outputs) {
                                    node.addOutput(
                                        extra.data.outputs[i][0],
                                        extra.data.outputs[i][1]
                                    );
                                }
                            }
                            if (extra.data.title) {
                                node.title = extra.data.title;
                            }
                            if (extra.data.json) {
                                node.configure(extra.data.json);
                            }

                        }

                        // join node after inserting
                        if (options.node_from) {
                            var iS = false;
                            switch (typeof options.slot_from) {
                                case "string":
                                    iS = options.node_from.findOutputSlot(options.slot_from);
                                    break;
                                case "object":
                                    if (options.slot_from.name) {
                                        iS = options.node_from.findOutputSlot(options.slot_from.name);
                                    } else {
                                        iS = -1;
                                    }
                                    if (iS == -1 && typeof options.slot_from.slot_index !== "undefined") iS = options.slot_from.slot_index;
                                    break;
                                case "number":
                                    iS = options.slot_from;
                                    break;
                                default:
                                    iS = 0; // try with first if no name set
                            }
                            if (typeof options.node_from.outputs[iS] !== "undefined") {
                                if (iS !== false && iS > -1) {
                                    options.node_from.connectByType(iS, node, options.node_from.outputs[iS].type);
                                }
                            } else {
                                // console.warn("cant find slot " + options.slot_from);
                            }
                        }
                        if (options.node_to) {
                            var iS = false;
                            switch (typeof options.slot_from) {
                                case "string":
                                    iS = options.node_to.findInputSlot(options.slot_from);
                                    break;
                                case "object":
                                    if (options.slot_from.name) {
                                        iS = options.node_to.findInputSlot(options.slot_from.name);
                                    } else {
                                        iS = -1;
                                    }
                                    if (iS == -1 && typeof options.slot_from.slot_index !== "undefined") iS = options.slot_from.slot_index;
                                    break;
                                case "number":
                                    iS = options.slot_from;
                                    break;
                                default:
                                    iS = 0; // try with first if no name set
                            }
                            if (typeof options.node_to.inputs[iS] !== "undefined") {
                                if (iS !== false && iS > -1) {
                                    // try connection
                                    options.node_to.connectByTypeOutput(iS, node, options.node_to.inputs[iS].type);
                                }
                            } else {
                                // console.warn("cant find slot_nodeTO " + options.slot_from);
                            }
                        }

                        graphcanvas.graph.afterChange();
                    }
                }

                dialog.close();
            }

            function changeSelection(forward) {
                var prev = selected;
                if (selected) {
                    selected.classList.remove("selected");
                }
                if (!selected) {
                    selected = forward
                        ? helper.childNodes[0]
                        : helper.childNodes[helper.childNodes.length];
                } else {
                    selected = forward
                        ? selected.nextSibling
                        : selected.previousSibling;
                    if (!selected) {
                        selected = prev;
                    }
                }
                if (!selected) {
                    return;
                }
                selected.classList.add("selected");
                selected.scrollIntoView({ block: "end", behavior: "smooth" });
            }

            function refreshHelper() {
                timeout = null;
                var str = input.value;
                first = null;
                helper.innerHTML = "";
                if (!str && !options.show_all_if_empty) {
                    return;
                }

                if (that.onSearchBox) {
                    var list = that.onSearchBox(helper, str, graphcanvas);
                    if (list) {
                        for (var i = 0; i < list.length; ++i) {
                            addResult(list[i]);
                        }
                    }
                } else {
                    var c = 0;
                    str = str.toLowerCase();
                    var filter = graphcanvas.filter || graphcanvas.graph.filter;

                    // filter by type preprocess
                    if (options.do_type_filter && that.search_box) {
                        var sIn = that.search_box.querySelector(".slot_in_type_filter");
                        var sOut = that.search_box.querySelector(".slot_out_type_filter");
                    } else {
                        var sIn = false;
                        var sOut = false;
                    }

                    //extras
                    for (var i in LiteGraph.searchbox_extras) {
                        var extra = LiteGraph.searchbox_extras[i];
                        if ((!options.show_all_if_empty || str) && extra.desc.toLowerCase().indexOf(str) === -1) {
                            continue;
                        }
                        var ctor = LiteGraph.registered_node_types[extra.type];
                        if (ctor && ctor.filter != filter)
                            continue;
                        if (!inner_test_filter(extra.type))
                            continue;
                        addResult(extra.desc, "searchbox_extra");
                        if (LGraphCanvas.search_limit !== -1 && c++ > LGraphCanvas.search_limit) {
                            break;
                        }
                    }

                    var filtered = null;
                    if (Array.prototype.filter) { //filter supported
                        var keys = Object.keys(LiteGraph.registered_node_types); //types
                        var filtered = keys.filter(inner_test_filter);
                    } else {
                        filtered = [];
                        for (var i in LiteGraph.registered_node_types) {
                            if (inner_test_filter(i))
                                filtered.push(i);
                        }
                    }

                    for (var i = 0; i < filtered.length; i++) {
                        addResult(filtered[i]);
                        if (LGraphCanvas.search_limit !== -1 && c++ > LGraphCanvas.search_limit) {
                            break;
                        }
                    }

                    // add general type if filtering
                    if (options.show_general_after_typefiltered
                        && (sIn.value || sOut.value)) {
                        filtered_extra = [];
                        for (var i in LiteGraph.registered_node_types) {
                            if (inner_test_filter(i, { inTypeOverride: sIn && sIn.value ? "*" : false, outTypeOverride: sOut && sOut.value ? "*" : false }))
                                filtered_extra.push(i);
                        }
                        for (var i = 0; i < filtered_extra.length; i++) {
                            addResult(filtered_extra[i], "generic_type");
                            if (LGraphCanvas.search_limit !== -1 && c++ > LGraphCanvas.search_limit) {
                                break;
                            }
                        }
                    }

                    // check il filtering gave no results
                    if ((sIn.value || sOut.value) &&
                        ((helper.childNodes.length == 0 && options.show_general_if_none_on_typefilter))) {
                        filtered_extra = [];
                        for (var i in LiteGraph.registered_node_types) {
                            if (inner_test_filter(i, { skipFilter: true }))
                                filtered_extra.push(i);
                        }
                        for (var i = 0; i < filtered_extra.length; i++) {
                            addResult(filtered_extra[i], "not_in_filter");
                            if (LGraphCanvas.search_limit !== -1 && c++ > LGraphCanvas.search_limit) {
                                break;
                            }
                        }
                    }

                    function inner_test_filter(type, optsIn) {
                        var optsIn = optsIn || {};
                        var optsDef = {
                            skipFilter: false,
                            inTypeOverride: false,
                            outTypeOverride: false
                        };
                        var opts = Object.assign(optsDef, optsIn);
                        var ctor = LiteGraph.registered_node_types[type];
                        if (filter && ctor.filter != filter)
                            return false;
                        if ((!options.show_all_if_empty || str) && type.toLowerCase().indexOf(str) === -1 && (!ctor.title || ctor.title.toLowerCase().indexOf(str) === -1))
                            return false;

                        // filter by slot IN, OUT types
                        if (options.do_type_filter && !opts.skipFilter) {
                            var sType = type;

                            var sV = sIn.value;
                            if (opts.inTypeOverride !== false) sV = opts.inTypeOverride;
                            //if (sV.toLowerCase() == "_event_") sV = LiteGraph.EVENT; // -1
                            if (sIn && sV) {
                                //console.log("will check filter against "+sV);
                                if (LiteGraph.registered_slot_in_types[sV] && LiteGraph.registered_slot_in_types[sV].nodes) { // type is stored
                                    //console.debug("check "+sType+" in "+LiteGraph.registered_slot_in_types[sV].nodes);
                                    var doesInc = LiteGraph.registered_slot_in_types[sV].nodes.includes(sType);
                                    if (doesInc !== false) {
                                        //console.log(sType+" HAS "+sV);
                                    } else {
                                        /*console.debug(LiteGraph.registered_slot_in_types[sV]);
                                        console.log(+" DONT includes "+type);*/
                                        return false;
                                    }
                                }
                            }

                            var sV = sOut.value;
                            if (opts.outTypeOverride !== false) sV = opts.outTypeOverride;
                            //if (sV.toLowerCase() == "_event_") sV = LiteGraph.EVENT; // -1
                            if (sOut && sV) {
                                //console.log("search will check filter against "+sV);
                                if (LiteGraph.registered_slot_out_types[sV] && LiteGraph.registered_slot_out_types[sV].nodes) { // type is stored
                                    //console.debug("check "+sType+" in "+LiteGraph.registered_slot_out_types[sV].nodes);
                                    var doesInc = LiteGraph.registered_slot_out_types[sV].nodes.includes(sType);
                                    if (doesInc !== false) {
                                        //console.log(sType+" HAS "+sV);
                                    } else {
                                        /*console.debug(LiteGraph.registered_slot_out_types[sV]);
                                        console.log(+" DONT includes "+type);*/
                                        return false;
                                    }
                                }
                            }
                        }
                        return true;
                    }
                }

                function addResult(type, className) {
                    var help = document.createElement("div");
                    if (!first) {
                        first = type;
                    }

                    const nodeType = LiteGraph.registered_node_types[type];
                    if (nodeType?.title) {
                        help.innerText = nodeType?.title;
                        const typeEl = document.createElement("span");
                        typeEl.className = "litegraph lite-search-item-type";
                        typeEl.textContent = type;
                        help.append(typeEl);
                    } else {
                        help.innerText = type;
                    }

                    help.dataset["type"] = escape(type);
                    help.className = "litegraph lite-search-item";
                    if (className) {
                        help.className += " " + className;
                    }
                    help.addEventListener("click", function (e) {
                        select(unescape(this.dataset["type"]));
                    });
                    helper.appendChild(help);
                }
            }

            return dialog;
        }
        showEditPropertyValue(node, property, options) {
            if (!node || node.properties[property] === undefined) {
                return;
            }

            options = options || {};
            var that = this;

            var info = node.getPropertyInfo(property);
            var type = info.type;

            var input_html = "";

            if (type == "string" || type == "number" || type == "array" || type == "object") {
                input_html = "<input autofocus type='text' class='value'/>";
            } else if ((type == "enum" || type == "combo") && info.values) {
                input_html = "<select autofocus type='text' class='value'>";
                for (var i in info.values) {
                    var v = i;
                    if (info.values.constructor === Array)
                        v = info.values[i];

                    input_html +=
                        "<option value='" +
                        v +
                        "' " +
                        (v == node.properties[property] ? "selected" : "") +
                        ">" +
                        info.values[i] +
                        "</option>";
                }
                input_html += "</select>";
            } else if (type == "boolean" || type == "toggle") {
                input_html =
                    "<input autofocus type='checkbox' class='value' " +
                    (node.properties[property] ? "checked" : "") +
                    "/>";
            } else {
                console.warn("unknown type: " + type);
                return;
            }

            var dialog = this.createDialog(
                "<span class='name'>" +
                (info.label ? info.label : property) +
                "</span>" +
                input_html +
                "<button>OK</button>",
                options
            );

            var input = false;
            if ((type == "enum" || type == "combo") && info.values) {
                input = dialog.querySelector("select");
                input.addEventListener("change", function (e) {
                    dialog.modified();
                    setValue(e.target.value);
                    //var index = e.target.value;
                    //setValue( e.options[e.selectedIndex].value );
                });
            } else if (type == "boolean" || type == "toggle") {
                input = dialog.querySelector("input");
                if (input) {
                    input.addEventListener("click", function (e) {
                        dialog.modified();
                        setValue(!!input.checked);
                    });
                }
            } else {
                input = dialog.querySelector("input");
                if (input) {
                    input.addEventListener("blur", function (e) {
                        this.focus();
                    });

                    var v = node.properties[property] !== undefined ? node.properties[property] : "";
                    if (type !== 'string') {
                        v = JSON.stringify(v);
                    }

                    input.value = v;
                    input.addEventListener("keydown", function (e) {
                        if (e.keyCode == 27) {
                            //ESC
                            dialog.close();
                        } else if (e.keyCode == 13) {
                            // ENTER
                            inner(); // save
                        } else if (e.keyCode != 13) {
                            dialog.modified();
                            return;
                        }
                        e.preventDefault();
                        e.stopPropagation();
                    });
                }
            }
            if (input) input.focus();

            var button = dialog.querySelector("button");
            button.addEventListener("click", inner);

            function inner() {
                setValue(input.value);
            }

            function setValue(value) {

                if (info && info.values && info.values.constructor === Object && info.values[value] != undefined)
                    value = info.values[value];

                if (typeof node.properties[property] == "number") {
                    value = Number(value);
                }
                if (type == "array" || type == "object") {
                    value = JSON.parse(value);
                }
                node.properties[property] = value;
                if (node.graph) {
                    node.graph._version++;
                }
                if (node.onPropertyChanged) {
                    node.onPropertyChanged(property, value);
                }
                if (options.onclose)
                    options.onclose();
                dialog.close();
                node.setDirtyCanvas(true, true);
            }

            return dialog;
        }
        // TODO refactor, theer are different dialog, some uses createDialog, some dont
        createDialog(html, options) {
            var def_options = { checkForInput: false, closeOnLeave: true, closeOnLeave_checkModified: true };
            options = Object.assign(def_options, options || {});

            var dialog = document.createElement("div");
            dialog.className = "graphdialog";
            dialog.innerHTML = html;
            dialog.is_modified = false;

            var rect = this.canvas.getBoundingClientRect();
            var offsetx = -20;
            var offsety = -20;
            if (rect) {
                offsetx -= rect.left;
                offsety -= rect.top;
            }

            if (options.position) {
                offsetx += options.position[0];
                offsety += options.position[1];
            } else if (options.event) {
                offsetx += options.event.clientX;
                offsety += options.event.clientY;
            } //centered
            else {
                offsetx += this.canvas.width * 0.5;
                offsety += this.canvas.height * 0.5;
            }

            dialog.style.left = offsetx + "px";
            dialog.style.top = offsety + "px";

            this.canvas.parentNode.appendChild(dialog);

            // acheck for input and use default behaviour: save on enter, close on esc
            if (options.checkForInput) {
                var aI = [];
                var focused = false;
                if (aI = dialog.querySelectorAll("input")) {
                    aI.forEach(function (iX) {
                        iX.addEventListener("keydown", function (e) {
                            dialog.modified();
                            if (e.keyCode == 27) {
                                dialog.close();
                            } else if (e.keyCode != 13) {
                                return;
                            }
                            // set value ?
                            e.preventDefault();
                            e.stopPropagation();
                        });
                        if (!focused) iX.focus();
                    });
                }
            }

            dialog.modified = function () {
                dialog.is_modified = true;
            };
            dialog.close = function () {
                if (dialog.parentNode) {
                    dialog.parentNode.removeChild(dialog);
                }
            };

            var dialogCloseTimer = null;
            var prevent_timeout = false;
            dialog.addEventListener("mouseleave", function (e) {
                if (prevent_timeout)
                    return;
                if (options.closeOnLeave || LiteGraph.dialog_close_on_mouse_leave)
                    if (!dialog.is_modified && LiteGraph.dialog_close_on_mouse_leave)
                        dialogCloseTimer = setTimeout(dialog.close, LiteGraph.dialog_close_on_mouse_leave_delay); //dialog.close();
            });
            dialog.addEventListener("mouseenter", function (e) {
                if (options.closeOnLeave || LiteGraph.dialog_close_on_mouse_leave)
                    if (dialogCloseTimer) clearTimeout(dialogCloseTimer);
            });
            var selInDia = dialog.querySelectorAll("select");
            if (selInDia) {
                // if filtering, check focus changed to comboboxes and prevent closing
                selInDia.forEach(function (selIn) {
                    selIn.addEventListener("click", function (e) {
                        prevent_timeout++;
                    });
                    selIn.addEventListener("blur", function (e) {
                        prevent_timeout = 0;
                    });
                    selIn.addEventListener("change", function (e) {
                        prevent_timeout = -1;
                    });
                });
            }

            return dialog;
        }
        createPanel(title, options) {
            options = options || {};

            var ref_window = options.window || window;
            var root = document.createElement("div");
            root.className = "litegraph dialog";
            root.innerHTML = "<div class='dialog-header'><span class='dialog-title'></span></div><div class='dialog-content'></div><div style='display:none;' class='dialog-alt-content'></div><div class='dialog-footer'></div>";
            root.header = root.querySelector(".dialog-header");

            if (options.width)
                root.style.width = options.width + (options.width.constructor === Number ? "px" : "");
            if (options.height)
                root.style.height = options.height + (options.height.constructor === Number ? "px" : "");
            if (options.closable) {
                var close = document.createElement("span");
                close.innerHTML = "&#10005;";
                close.classList.add("close");
                close.addEventListener("click", function () {
                    root.close();
                });
                root.header.appendChild(close);
            }
            root.title_element = root.querySelector(".dialog-title");
            root.title_element.innerText = title;
            root.content = root.querySelector(".dialog-content");
            root.alt_content = root.querySelector(".dialog-alt-content");
            root.footer = root.querySelector(".dialog-footer");

            root.close = function () {
                if (root.onClose && typeof root.onClose == "function") {
                    root.onClose();
                }
                if (root.parentNode)
                    root.parentNode.removeChild(root);
                /* XXX CHECK THIS */
                if (this.parentNode) {
                    this.parentNode.removeChild(this);
                }
                /* XXX this was not working, was fixed with an IF, check this */
            };

            // function to swap panel content
            root.toggleAltContent = function (force) {
                if (typeof force != "undefined") {
                    var vTo = force ? "block" : "none";
                    var vAlt = force ? "none" : "block";
                } else {
                    var vTo = root.alt_content.style.display != "block" ? "block" : "none";
                    var vAlt = root.alt_content.style.display != "block" ? "none" : "block";
                }
                root.alt_content.style.display = vTo;
                root.content.style.display = vAlt;
            };

            root.toggleFooterVisibility = function (force) {
                if (typeof force != "undefined") {
                    var vTo = force ? "block" : "none";
                } else {
                    var vTo = root.footer.style.display != "block" ? "block" : "none";
                }
                root.footer.style.display = vTo;
            };

            root.clear = function () {
                this.content.innerHTML = "";
            };

            root.addHTML = function (code, classname, on_footer) {
                var elem = document.createElement("div");
                if (classname)
                    elem.className = classname;
                elem.innerHTML = code;
                if (on_footer)
                    root.footer.appendChild(elem);

                else
                    root.content.appendChild(elem);
                return elem;
            };

            root.addButton = function (name, callback, options) {
                var elem = document.createElement("button");
                elem.innerText = name;
                elem.options = options;
                elem.classList.add("btn");
                elem.addEventListener("click", callback);
                root.footer.appendChild(elem);
                return elem;
            };

            root.addSeparator = function () {
                var elem = document.createElement("div");
                elem.className = "separator";
                root.content.appendChild(elem);
            };

            root.addWidget = function (type, name, value, options, callback) {
                options = options || {};
                var str_value = String(value);
                type = type.toLowerCase();
                if (type == "number")
                    str_value = value.toFixed(3);

                var elem = document.createElement("div");
                elem.className = "property";
                elem.innerHTML = "<span class='property_name'></span><span class='property_value'></span>";
                elem.querySelector(".property_name").innerText = options.label || name;
                var value_element = elem.querySelector(".property_value");
                value_element.innerText = str_value;
                elem.dataset["property"] = name;
                elem.dataset["type"] = options.type || type;
                elem.options = options;
                elem.value = value;

                if (type == "code")
                    elem.addEventListener("click", function (e) { root.inner_showCodePad(this.dataset["property"]); });
                else if (type == "boolean") {
                    elem.classList.add("boolean");
                    if (value)
                        elem.classList.add("bool-on");
                    elem.addEventListener("click", function () {
                        //var v = node.properties[this.dataset["property"]]; 
                        //node.setProperty(this.dataset["property"],!v); this.innerText = v ? "true" : "false"; 
                        var propname = this.dataset["property"];
                        this.value = !this.value;
                        this.classList.toggle("bool-on");
                        this.querySelector(".property_value").innerText = this.value ? "true" : "false";
                        innerChange(propname, this.value);
                    });
                }
                else if (type == "string" || type == "number") {
                    value_element.setAttribute("contenteditable", true);
                    value_element.addEventListener("keydown", function (e) {
                        if (e.code == "Enter" && (type != "string" || !e.shiftKey)) // allow for multiline
                        {
                            e.preventDefault();
                            this.blur();
                        }
                    });
                    value_element.addEventListener("blur", function () {
                        var v = this.innerText;
                        var propname = this.parentNode.dataset["property"];
                        var proptype = this.parentNode.dataset["type"];
                        if (proptype == "number")
                            v = Number(v);
                        innerChange(propname, v);
                    });
                }
                else if (type == "enum" || type == "combo") {
                    var str_value = LGraphCanvas.getPropertyPrintableValue(value, options.values);
                    value_element.innerText = str_value;

                    value_element.addEventListener("click", function (event) {
                        var values = options.values || [];
                        var propname = this.parentNode.dataset["property"];
                        var elem_that = this;
                        var menu = new LiteGraph.ContextMenu(values, {
                            event: event,
                            className: "dark",
                            callback: inner_clicked
                        },
                            ref_window);
                        function inner_clicked(v, option, event) {
                            //node.setProperty(propname,v); 
                            //graphcanvas.dirty_canvas = true;
                            elem_that.innerText = v;
                            innerChange(propname, v);
                            return false;
                        }
                    });
                }

                root.content.appendChild(elem);

                function innerChange(name, value) {
                    //console.log("change",name,value);
                    //that.dirty_canvas = true;
                    if (options.callback)
                        options.callback(name, value, options);
                    if (callback)
                        callback(name, value, options);
                }

                return elem;
            };

            if (root.onOpen && typeof root.onOpen == "function") root.onOpen();

            return root;
        }
        closePanels() {
            var panel = document.querySelector("#node-panel");
            if (panel)
                panel.close();
            var panel = document.querySelector("#option-panel");
            if (panel)
                panel.close();
        }
        showShowGraphOptionsPanel(refOpts, obEv, refMenu, refMenu2) {
            if (this.constructor && this.constructor.name == "HTMLDivElement") {
                // assume coming from the menu event click
                if (!obEv || !obEv.event || !obEv.event.target || !obEv.event.target.lgraphcanvas) {
                    console.warn("Canvas not found"); // need a ref to canvas obj


                    /*console.debug(event);
                    console.debug(event.target);*/
                    return;
                }
                var graphcanvas = obEv.event.target.lgraphcanvas;
            } else {
                // assume called internally
                var graphcanvas = this;
            }
            graphcanvas.closePanels();
            var ref_window = graphcanvas.getCanvasWindow();
            panel = graphcanvas.createPanel("Options", {
                closable: true,
                window: ref_window,
                onOpen: function () {
                    graphcanvas.OPTIONPANEL_IS_OPEN = true;
                },
                onClose: function () {
                    graphcanvas.OPTIONPANEL_IS_OPEN = false;
                    graphcanvas.options_panel = null;
                }
            });
            graphcanvas.options_panel = panel;
            panel.id = "option-panel";
            panel.classList.add("settings");

            function inner_refresh() {

                panel.content.innerHTML = ""; //clear

                var fUpdate = function (name, value, options) {
                    switch (name) {
                        /*case "Render mode":
                            // Case ""..
                            if (options.values && options.key){
                                var kV = Object.values(options.values).indexOf(value);
                                if (kV>=0 && options.values[kV]){
                                    console.debug("update graph options: "+options.key+": "+kV);
                                    graphcanvas[options.key] = kV;
                                    //console.debug(graphcanvas);
                                    break;
                                }
                            }
                            console.warn("unexpected options");
                            console.debug(options);
                            break;*/
                        default:
                            //console.debug("want to update graph options: "+name+": "+value);
                            if (options && options.key) {
                                name = options.key;
                            }
                            if (options.values) {
                                value = Object.values(options.values).indexOf(value);
                            }
                            //console.debug("update graph option: "+name+": "+value);
                            graphcanvas[name] = value;
                            break;
                    }
                };

                // panel.addWidget( "string", "Graph name", "", {}, fUpdate); // implement
                var aProps = LiteGraph.availableCanvasOptions;
                aProps.sort();
                for (var pI in aProps) {
                    var pX = aProps[pI];
                    panel.addWidget("boolean", pX, graphcanvas[pX], { key: pX, on: "True", off: "False" }, fUpdate);
                }

                var aLinks = [graphcanvas.links_render_mode];
                panel.addWidget("combo", "Render mode", LiteGraph.LINK_RENDER_MODES[graphcanvas.links_render_mode], { key: "links_render_mode", values: LiteGraph.LINK_RENDER_MODES }, fUpdate);

                panel.addSeparator();

                panel.footer.innerHTML = ""; // clear

            }
            inner_refresh();

            graphcanvas.canvas.parentNode.appendChild(panel);
        }
        showShowNodePanel(node) {
            this.SELECTED_NODE = node;
            this.closePanels();
            var ref_window = this.getCanvasWindow();
            var that = this;
            var graphcanvas = this;
            var panel = this.createPanel(node.title || "", {
                closable: true,
                window: ref_window,
                onOpen: function () {
                    graphcanvas.NODEPANEL_IS_OPEN = true;
                },
                onClose: function () {
                    graphcanvas.NODEPANEL_IS_OPEN = false;
                    graphcanvas.node_panel = null;
                }
            });
            graphcanvas.node_panel = panel;
            panel.id = "node-panel";
            panel.node = node;
            panel.classList.add("settings");

            function inner_refresh() {
                panel.content.innerHTML = ""; //clear
                panel.addHTML("<span class='node_type'>" + node.type + "</span><span class='node_desc'>" + (node.constructor.desc || "") + "</span><span class='separator'></span>");

                panel.addHTML("<h3>Properties</h3>");

                var fUpdate = function (name, value) {
                    graphcanvas.graph.beforeChange(node);
                    switch (name) {
                        case "Title":
                            node.title = value;
                            break;
                        case "Mode":
                            var kV = Object.values(LiteGraph.NODE_MODES).indexOf(value);
                            if (kV >= 0 && LiteGraph.NODE_MODES[kV]) {
                                node.changeMode(kV);
                            } else {
                                console.warn("unexpected mode: " + value);
                            }
                            break;
                        case "Color":
                            if (LGraphCanvas.node_colors[value]) {
                                node.color = LGraphCanvas.node_colors[value].color;
                                node.bgcolor = LGraphCanvas.node_colors[value].bgcolor;
                            } else {
                                console.warn("unexpected color: " + value);
                            }
                            break;
                        default:
                            node.setProperty(name, value);
                            break;
                    }
                    graphcanvas.graph.afterChange();
                    graphcanvas.dirty_canvas = true;
                };

                panel.addWidget("string", "Title", node.title, {}, fUpdate);

                panel.addWidget("combo", "Mode", LiteGraph.NODE_MODES[node.mode], { values: LiteGraph.NODE_MODES }, fUpdate);

                var nodeCol = "";
                if (node.color !== undefined) {
                    nodeCol = Object.keys(LGraphCanvas.node_colors).filter(function (nK) { return LGraphCanvas.node_colors[nK].color == node.color; });
                }

                panel.addWidget("combo", "Color", nodeCol, { values: Object.keys(LGraphCanvas.node_colors) }, fUpdate);

                for (var pName in node.properties) {
                    var value = node.properties[pName];
                    var info = node.getPropertyInfo(pName);
                    var type = info.type || "string";

                    //in case the user wants control over the side panel widget
                    if (node.onAddPropertyToPanel && node.onAddPropertyToPanel(pName, panel))
                        continue;

                    panel.addWidget(info.widget || info.type, pName, value, info, fUpdate);
                }

                panel.addSeparator();

                if (node.onShowCustomPanelInfo)
                    node.onShowCustomPanelInfo(panel);

                panel.footer.innerHTML = ""; // clear
                panel.addButton("Delete", function () {
                    if (node.block_delete)
                        return;
                    node.graph.remove(node);
                    panel.close();
                }).classList.add("delete");
            }

            panel.inner_showCodePad = function (propname) {
                panel.classList.remove("settings");
                panel.classList.add("centered");


                /*if(window.CodeFlask) //disabled for now
                {
                    panel.content.innerHTML = "<div class='code'></div>";
                    var flask = new CodeFlask( "div.code", { language: 'js' });
                    flask.updateCode(node.properties[propname]);
                    flask.onUpdate( function(code) {
                        node.setProperty(propname, code);
                    });
                }
                else
                {*/
                panel.alt_content.innerHTML = "<textarea class='code'></textarea>";
                var textarea = panel.alt_content.querySelector("textarea");
                var fDoneWith = function () {
                    panel.toggleAltContent(false); //if(node_prop_div) node_prop_div.style.display = "block"; // panel.close();
                    panel.toggleFooterVisibility(true);
                    textarea.parentNode.removeChild(textarea);
                    panel.classList.add("settings");
                    panel.classList.remove("centered");
                    inner_refresh();
                };
                textarea.value = node.properties[propname];
                textarea.addEventListener("keydown", function (e) {
                    if (e.code == "Enter" && e.ctrlKey) {
                        node.setProperty(propname, textarea.value);
                        fDoneWith();
                    }
                });
                panel.toggleAltContent(true);
                panel.toggleFooterVisibility(false);
                textarea.style.height = "calc(100% - 40px)";
                /*}*/
                var assign = panel.addButton("Assign", function () {
                    node.setProperty(propname, textarea.value);
                    fDoneWith();
                });
                panel.alt_content.appendChild(assign); //panel.content.appendChild(assign);
                var button = panel.addButton("Close", fDoneWith);
                button.style.float = "right";
                panel.alt_content.appendChild(button); // panel.content.appendChild(button);
            };

            inner_refresh();

            this.canvas.parentNode.appendChild(panel);
        }
        showSubgraphPropertiesDialog(node) {
            console.log("showing subgraph properties dialog");

            var old_panel = this.canvas.parentNode.querySelector(".subgraph_dialog");
            if (old_panel)
                old_panel.close();

            var panel = this.createPanel("Subgraph Inputs", { closable: true, width: 500 });
            panel.node = node;
            panel.classList.add("subgraph_dialog");

            function inner_refresh() {
                panel.clear();

                //show currents
                if (node.inputs)
                    for (var i = 0; i < node.inputs.length; ++i) {
                        var input = node.inputs[i];
                        if (input.not_subgraph_input)
                            continue;
                        var html = "<button>&#10005;</button> <span class='bullet_icon'></span><span class='name'></span><span class='type'></span>";
                        var elem = panel.addHTML(html, "subgraph_property");
                        elem.dataset["name"] = input.name;
                        elem.dataset["slot"] = i;
                        elem.querySelector(".name").innerText = input.name;
                        elem.querySelector(".type").innerText = input.type;
                        elem.querySelector("button").addEventListener("click", function (e) {
                            node.removeInput(Number(this.parentNode.dataset["slot"]));
                            inner_refresh();
                        });
                    }
            }

            //add extra
            var html = " + <span class='label'>Name</span><input class='name'/><span class='label'>Type</span><input class='type'></input><button>+</button>";
            var elem = panel.addHTML(html, "subgraph_property extra", true);
            elem.querySelector("button").addEventListener("click", function (e) {
                var elem = this.parentNode;
                var name = elem.querySelector(".name").value;
                var type = elem.querySelector(".type").value;
                if (!name || node.findInputSlot(name) != -1)
                    return;
                node.addInput(name, type);
                elem.querySelector(".name").value = "";
                elem.querySelector(".type").value = "";
                inner_refresh();
            });

            inner_refresh();
            this.canvas.parentNode.appendChild(panel);
            return panel;
        }
        showSubgraphPropertiesDialogRight(node) {

            // console.log("showing subgraph properties dialog");
            var that = this;
            // old_panel if old_panel is exist close it
            var old_panel = this.canvas.parentNode.querySelector(".subgraph_dialog");
            if (old_panel)
                old_panel.close();
            // new panel
            var panel = this.createPanel("Subgraph Outputs", { closable: true, width: 500 });
            panel.node = node;
            panel.classList.add("subgraph_dialog");

            function inner_refresh() {
                panel.clear();
                //show currents
                if (node.outputs)
                    for (var i = 0; i < node.outputs.length; ++i) {
                        var input = node.outputs[i];
                        if (input.not_subgraph_output)
                            continue;
                        var html = "<button>&#10005;</button> <span class='bullet_icon'></span><span class='name'></span><span class='type'></span>";
                        var elem = panel.addHTML(html, "subgraph_property");
                        elem.dataset["name"] = input.name;
                        elem.dataset["slot"] = i;
                        elem.querySelector(".name").innerText = input.name;
                        elem.querySelector(".type").innerText = input.type;
                        elem.querySelector("button").addEventListener("click", function (e) {
                            node.removeOutput(Number(this.parentNode.dataset["slot"]));
                            inner_refresh();
                        });
                    }
            }

            //add extra
            var html = " + <span class='label'>Name</span><input class='name'/><span class='label'>Type</span><input class='type'></input><button>+</button>";
            var elem = panel.addHTML(html, "subgraph_property extra", true);
            elem.querySelector(".name").addEventListener("keydown", function (e) {
                if (e.keyCode == 13) {
                    addOutput.apply(this);
                }
            });
            elem.querySelector("button").addEventListener("click", function (e) {
                addOutput.apply(this);
            });
            function addOutput() {
                var elem = this.parentNode;
                var name = elem.querySelector(".name").value;
                var type = elem.querySelector(".type").value;
                if (!name || node.findOutputSlot(name) != -1)
                    return;
                node.addOutput(name, type);
                elem.querySelector(".name").value = "";
                elem.querySelector(".type").value = "";
                inner_refresh();
            }

            inner_refresh();
            this.canvas.parentNode.appendChild(panel);
            return panel;
        }
        checkPanels() {
            if (!this.canvas)
                return;
            var panels = this.canvas.parentNode.querySelectorAll(".litegraph.dialog");
            for (var i = 0; i < panels.length; ++i) {
                var panel = panels[i];
                if (!panel.node)
                    continue;
                if (!panel.node.graph || panel.graph != this.graph)
                    panel.close();
            }
        }
        getCanvasMenuOptions() {
            var options = null;
            var that = this;
            if (this.getMenuOptions) {
                options = this.getMenuOptions();
            } else {
                options = [
                    {
                        content: "Add Node",
                        has_submenu: true,
                        callback: LGraphCanvas.onMenuAdd
                    },
                    { content: "Add Group", callback: LGraphCanvas.onGroupAdd },
                    //{ content: "Arrange", callback: that.graph.arrange },
                    //{content:"Collapse All", callback: LGraphCanvas.onMenuCollapseAll }
                ];
                /*if (LiteGraph.showCanvasOptions){
                    options.push({ content: "Options", callback: that.showShowGraphOptionsPanel });
                }*/
                if (Object.keys(this.selected_nodes).length > 1) {
                    options.push({
                        content: "Align",
                        has_submenu: true,
                        callback: LGraphCanvas.onGroupAlign,
                    });
                }

                if (this._graph_stack && this._graph_stack.length > 0) {
                    options.push(null, {
                        content: "Close subgraph",
                        callback: this.closeSubgraph.bind(this)
                    });
                }
            }

            if (this.getExtraMenuOptions) {
                var extra = this.getExtraMenuOptions(this, options);
                if (extra) {
                    options = options.concat(extra);
                }
            }

            return options;
        }
        //called by processContextMenu to extract the menu list
        getNodeMenuOptions(node) {
            var options = null;

            if (node.getMenuOptions) {
                options = node.getMenuOptions(this);
            } else {
                options = [
                    {
                        content: "Inputs",
                        has_submenu: true,
                        disabled: true,
                        callback: LGraphCanvas.showMenuNodeOptionalInputs
                    },
                    {
                        content: "Outputs",
                        has_submenu: true,
                        disabled: true,
                        callback: LGraphCanvas.showMenuNodeOptionalOutputs
                    },
                    null,
                    {
                        content: "Properties",
                        has_submenu: true,
                        callback: LGraphCanvas.onShowMenuNodeProperties
                    },
                    {
                        content: "Properties Panel",
                        callback: function (item, options, e, menu, node) { LGraphCanvas.active_canvas.showShowNodePanel(node); }
                    },
                    null,
                    {
                        content: "Title",
                        callback: LGraphCanvas.onShowPropertyEditor
                    },
                    {
                        content: "Mode",
                        has_submenu: true,
                        callback: LGraphCanvas.onMenuNodeMode
                    }
                ];
                if (node.resizable !== false) {
                    options.push({
                        content: "Resize", callback: LGraphCanvas.onMenuResizeNode
                    });
                }
                if (node.collapsible) {
                    options.push({
                        content: node.collapsed ? "Expand" : "Collapse",
                        callback: LGraphCanvas.onMenuNodeCollapse
                    });
                }
                options.push(
                    {
                        content: node.pinned ? "Unpin" : "Pin",
                        callback: (...args) => {
                            LGraphCanvas.onMenuNodePin(...args);
                            for (const i in this.selected_nodes) {
                                const node = this.selected_nodes[i]
                                node.pin()
                            }
                            this.setDirty(true, true);
                        }
                    },
                    {
                        content: "Colors",
                        has_submenu: true,
                        callback: LGraphCanvas.onMenuNodeColors
                    },
                    {
                        content: "Shapes",
                        has_submenu: true,
                        callback: LGraphCanvas.onMenuNodeShapes
                    },
                    null
                );
            }

            if (node.onGetInputs) {
                var inputs = node.onGetInputs();
                if (inputs && inputs.length) {
                    options[0].disabled = false;
                }
            }

            if (node.onGetOutputs) {
                var outputs = node.onGetOutputs();
                if (outputs && outputs.length) {
                    options[1].disabled = false;
                }
            }

            if (node.getExtraMenuOptions) {
                var extra = node.getExtraMenuOptions(this, options);
                if (extra) {
                    extra.push(null);
                    options = extra.concat(options);
                }
            }

            if (node.clonable !== false) {
                options.push({
                    content: "Clone",
                    callback: LGraphCanvas.onMenuNodeClone
                });
            }

            if (0) //TODO
                options.push({
                    content: "To Subgraph",
                    callback: LGraphCanvas.onMenuNodeToSubgraph
                });

            if (Object.keys(this.selected_nodes).length > 1) {
                options.push({
                    content: "Align Selected To",
                    has_submenu: true,
                    callback: LGraphCanvas.onNodeAlign,
                });
            }

            options.push(null, {
                content: "Remove",
                disabled: !(node.removable !== false && !node.block_delete),
                callback: LGraphCanvas.onMenuNodeRemove
            });

            if (node.graph && node.graph.onGetNodeMenuOptions) {
                node.graph.onGetNodeMenuOptions(options, node);
            }

            return options;
        }
        getGroupMenuOptions(node) {
            console.warn("LGraphCanvas.getGroupMenuOptions is deprecated, use LGraphGroup.getMenuOptions instead");
            return node.getMenuOptions();
        }
        processContextMenu(node, event) {
            var that = this;
            var canvas = LGraphCanvas.active_canvas;
            var ref_window = canvas.getCanvasWindow();

            var menu_info = null;
            var options = {
                event: event,
                callback: inner_option_clicked,
                extra: node
            };

            if (node)
                options.title = node.type;

            //check if mouse is in input
            var slot = null;
            if (node) {
                slot = node.getSlotInPosition(event.canvasX, event.canvasY);
                LGraphCanvas.active_node = node;
            }

            if (slot) {
                //on slot
                menu_info = [];
                if (node.getSlotMenuOptions) {
                    menu_info = node.getSlotMenuOptions(slot);
                } else {
                    if (slot &&
                        slot.output &&
                        slot.output.links &&
                        slot.output.links.length) {
                        menu_info.push({ content: "Disconnect Links", slot: slot });
                    }
                    var _slot = slot.input || slot.output;
                    if (_slot.removable) {
                        menu_info.push(
                            _slot.locked
                                ? "Cannot remove"
                                : { content: "Remove Slot", slot: slot }
                        );
                    }
                    if (!_slot.nameLocked) {
                        menu_info.push({ content: "Rename Slot", slot: slot });
                    }

                }
                options.title =
                    (slot.input ? slot.input.type : slot.output.type) || "*";
                if (slot.input && slot.input.type == LiteGraph.ACTION) {
                    options.title = "Action";
                }
                if (slot.output && slot.output.type == LiteGraph.EVENT) {
                    options.title = "Event";
                }
            } else {
                if (node) {
                    //on node
                    menu_info = this.getNodeMenuOptions(node);
                } else {
                    menu_info = this.getCanvasMenuOptions();
                    var group = this.graph.getGroupOnPos(
                        event.canvasX,
                        event.canvasY
                    );
                    if (group) {
                        //on group
                        menu_info.push(null, {
                            content: "Edit Group",
                            has_submenu: true,
                            submenu: {
                                title: "Group",
                                extra: group,
                                options: group.getMenuOptions()
                            }
                        });
                    }
                }
            }

            //show menu
            if (!menu_info) {
                return;
            }

            var menu = new LiteGraph.ContextMenu(menu_info, options, ref_window);

            function inner_option_clicked(v, options, e) {
                if (!v) {
                    return;
                }

                if (v.content == "Remove Slot") {
                    var info = v.slot;
                    node.graph.beforeChange();
                    if (info.input) {
                        node.removeInput(info.slot);
                    } else if (info.output) {
                        node.removeOutput(info.slot);
                    }
                    node.graph.afterChange();
                    return;
                } else if (v.content == "Disconnect Links") {
                    var info = v.slot;
                    node.graph.beforeChange();
                    if (info.output) {
                        node.disconnectOutput(info.slot);
                    } else if (info.input) {
                        node.disconnectInput(info.slot);
                    }
                    node.graph.afterChange();
                    return;
                } else if (v.content == "Rename Slot") {
                    var info = v.slot;
                    var slot_info = info.input
                        ? node.getInputInfo(info.slot)
                        : node.getOutputInfo(info.slot);
                    var dialog = that.createDialog(
                        "<span class='name'>Name</span><input autofocus type='text'/><button>OK</button>",
                        options
                    );
                    var input = dialog.querySelector("input");
                    if (input && slot_info) {
                        input.value = slot_info.label || "";
                    }
                    var inner = function () {
                        node.graph.beforeChange();
                        if (input.value) {
                            if (slot_info) {
                                slot_info.label = input.value;
                            }
                            that.setDirty(true);
                        }
                        dialog.close();
                        node.graph.afterChange();
                    };
                    dialog.querySelector("button").addEventListener("click", inner);
                    input.addEventListener("keydown", function (e) {
                        dialog.is_modified = true;
                        if (e.keyCode == 27) {
                            //ESC
                            dialog.close();
                        } else if (e.keyCode == 13) {
                            inner(); // save
                        } else if (e.keyCode != 13 && e.target.localName != "textarea") {
                            return;
                        }
                        e.preventDefault();
                        e.stopPropagation();
                    });
                    input.focus();
                }

                //if(v.callback)
                //	return v.callback.call(that, node, options, e, menu, that, event );
            }
        }
    }

    globalThis.LGraphCanvas = LiteGraph.LGraphCanvas = LGraphCanvas;
    //API *************************************************
    //like rect but rounded corners
    if (typeof(window) != "undefined" && window.CanvasRenderingContext2D && !window.CanvasRenderingContext2D.prototype.roundRect) {
        window.CanvasRenderingContext2D.prototype.roundRect = function(
		x,
		y,
		w,
		h,
		radius,
		radius_low
	) {
		var top_left_radius = 0;
		var top_right_radius = 0;
		var bottom_left_radius = 0;
		var bottom_right_radius = 0;

		if ( radius === 0 )
		{
			this.rect(x,y,w,h);
			return;
		}

		if(radius_low === undefined)
			radius_low = radius;

		//make it compatible with official one
		if(radius != null && radius.constructor === Array)
		{
			if(radius.length == 1)
				top_left_radius = top_right_radius = bottom_left_radius = bottom_right_radius = radius[0];
			else if(radius.length == 2)
			{
				top_left_radius = bottom_right_radius = radius[0];
				top_right_radius = bottom_left_radius = radius[1];
			}
			else if(radius.length == 4)
			{
				top_left_radius = radius[0];
				top_right_radius = radius[1];
				bottom_left_radius = radius[2];
				bottom_right_radius = radius[3];
			}
			else
				return;
		}
		else //old using numbers
		{
			top_left_radius = radius || 0;
			top_right_radius = radius || 0;
			bottom_left_radius = radius_low || 0;
			bottom_right_radius = radius_low || 0;
		}

		//top right
		this.moveTo(x + top_left_radius, y);
		this.lineTo(x + w - top_right_radius, y);
		this.quadraticCurveTo(x + w, y, x + w, y + top_right_radius);

		//bottom right
		this.lineTo(x + w, y + h - bottom_right_radius);
		this.quadraticCurveTo(
			x + w,
			y + h,
			x + w - bottom_right_radius,
			y + h
		);

		//bottom left
		this.lineTo(x + bottom_right_radius, y + h);
		this.quadraticCurveTo(x, y + h, x, y + h - bottom_left_radius);

		//top left
		this.lineTo(x, y + bottom_left_radius);
		this.quadraticCurveTo(x, y, x + top_left_radius, y);
	};
	}//if

    function compareObjects(a, b) {
        for (var i in a) {
            if (a[i] != b[i]) {
                return false;
            }
        }
        return true;
    }
    LiteGraph.compareObjects = compareObjects;

    function distance(a, b) {
        return Math.sqrt(
            (b[0] - a[0]) * (b[0] - a[0]) + (b[1] - a[1]) * (b[1] - a[1])
        );
    }
    LiteGraph.distance = distance;

    function colorToString(c) {
        return (
            "rgba(" +
            Math.round(c[0] * 255).toFixed() +
            "," +
            Math.round(c[1] * 255).toFixed() +
            "," +
            Math.round(c[2] * 255).toFixed() +
            "," +
            (c.length == 4 ? c[3].toFixed(2) : "1.0") +
            ")"
        );
    }
    LiteGraph.colorToString = colorToString;

    function isInsideRectangle(x, y, left, top, width, height) {
        if (left < x && left + width > x && top < y && top + height > y) {
            return true;
        }
        return false;
    }
    LiteGraph.isInsideRectangle = isInsideRectangle;

    //[minx,miny,maxx,maxy]
    function growBounding(bounding, x, y) {
        if (x < bounding[0]) {
            bounding[0] = x;
        } else if (x > bounding[2]) {
            bounding[2] = x;
        }

        if (y < bounding[1]) {
            bounding[1] = y;
        } else if (y > bounding[3]) {
            bounding[3] = y;
        }
    }
    LiteGraph.growBounding = growBounding;

    //point inside bounding box
    function isInsideBounding(p, bb) {
        if (
            p[0] < bb[0][0] ||
            p[1] < bb[0][1] ||
            p[0] > bb[1][0] ||
            p[1] > bb[1][1]
        ) {
            return false;
        }
        return true;
    }
    LiteGraph.isInsideBounding = isInsideBounding;

    //bounding overlap, format: [ startx, starty, width, height ]
    function overlapBounding(a, b) {
        var A_end_x = a[0] + a[2];
        var A_end_y = a[1] + a[3];
        var B_end_x = b[0] + b[2];
        var B_end_y = b[1] + b[3];

        if (
            a[0] > B_end_x ||
            a[1] > B_end_y ||
            A_end_x < b[0] ||
            A_end_y < b[1]
        ) {
            return false;
        }
        return true;
    }
    LiteGraph.overlapBounding = overlapBounding;

    //Convert a hex value to its decimal value - the inputted hex must be in the
    //	format of a hex triplet - the kind we use for HTML colours. The function
    //	will return an array with three values.
    function hex2num(hex) {
        if (hex.charAt(0) == "#") {
            hex = hex.slice(1);
        } //Remove the '#' char - if there is one.
        hex = hex.toUpperCase();
        var hex_alphabets = "0123456789ABCDEF";
        var value = new Array(3);
        var k = 0;
        var int1, int2;
        for (var i = 0; i < 6; i += 2) {
            int1 = hex_alphabets.indexOf(hex.charAt(i));
            int2 = hex_alphabets.indexOf(hex.charAt(i + 1));
            value[k] = int1 * 16 + int2;
            k++;
        }
        return value;
    }

    LiteGraph.hex2num = hex2num;

    //Give a array with three values as the argument and the function will return
    //	the corresponding hex triplet.
    function num2hex(triplet) {
        var hex_alphabets = "0123456789ABCDEF";
        var hex = "#";
        var int1, int2;
        for (var i = 0; i < 3; i++) {
            int1 = triplet[i] / 16;
            int2 = triplet[i] % 16;

            hex += hex_alphabets.charAt(int1) + hex_alphabets.charAt(int2);
        }
        return hex;
    }

    LiteGraph.num2hex = num2hex;

    /* LiteGraph GUI elements used for canvas editing *************************************/

    /**
     * ContextMenu from LiteGUI
     *
     * @class ContextMenu
     * @constructor
     * @param {Array} values (allows object { title: "Nice text", callback: function ... })
     * @param {Object} options [optional] Some options:\
     * - title: title to show on top of the menu
     * - callback: function to call when an option is clicked, it receives the item information
     * - ignore_item_callbacks: ignores the callback inside the item, it just calls the options.callback
     * - event: you can pass a MouseEvent, this way the ContextMenu appears in that position
     */
    function ContextMenu(values, options) {
        options = options || {};
        this.options = options;
        var that = this;

        //to link a menu with its parent
        if (options.parentMenu) {
            if (options.parentMenu.constructor !== this.constructor) {
                console.error(
                    "parentMenu must be of class ContextMenu, ignoring it"
                );
                options.parentMenu = null;
            } else {
                this.parentMenu = options.parentMenu;
                this.parentMenu.lock = true;
                this.parentMenu.current_submenu = this;
            }
        }

		var eventClass = null;
		if(options.event) //use strings because comparing classes between windows doesnt work
			eventClass = options.event.constructor.name;
        if ( eventClass !== "MouseEvent" &&
            eventClass !== "CustomEvent" &&
			eventClass !== "PointerEvent"
        ) {
            console.error(
                "Event passed to ContextMenu is not of type MouseEvent or CustomEvent. Ignoring it. ("+eventClass+")"
            );
            options.event = null;
        }

        var root = document.createElement("div");
        root.className = "litegraph litecontextmenu litemenubar-panel";
        if (options.className) {
            root.className += " " + options.className;
        }
        root.style.minWidth = 100;
        root.style.minHeight = 100;
        root.style.pointerEvents = "none";
        setTimeout(function() {
            root.style.pointerEvents = "auto";
        }, 100); //delay so the mouse up event is not caught by this element

        //this prevents the default context browser menu to open in case this menu was created when pressing right button
		LiteGraph.pointerListenerAdd(root,"up",
            function(e) {
			  	//console.log("pointerevents: ContextMenu up root prevent");
                e.preventDefault();
                return true;
            },
            true
        );
        root.addEventListener(
            "contextmenu",
            function(e) {
                if (e.button != 2) {
                    //right button
                    return false;
                }
                e.preventDefault();
                return false;
            },
            true
        );

        LiteGraph.pointerListenerAdd(root,"down",
            function(e) {
			  	//console.log("pointerevents: ContextMenu down");
                if (e.button == 2) {
                    that.close();
                    e.preventDefault();
                    return true;
                }
            },
            true
        );

        function on_mouse_wheel(e) {
            var pos = parseInt(root.style.top);
            root.style.top =
                (pos + e.deltaY * options.scroll_speed).toFixed() + "px";
            e.preventDefault();
            return true;
        }

        if (!options.scroll_speed) {
            options.scroll_speed = 0.1;
        }

        root.addEventListener("wheel", on_mouse_wheel, true);
        root.addEventListener("mousewheel", on_mouse_wheel, true);

        this.root = root;

        //title
        if (options.title) {
            var element = document.createElement("div");
            element.className = "litemenu-title";
            element.innerHTML = options.title;
            root.appendChild(element);
        }

        //entries
        var num = 0;
        for (var i=0; i < values.length; i++) {
            var name = values.constructor == Array ? values[i] : i;
            if (name != null && name.constructor !== String) {
                name = name.content === undefined ? String(name) : name.content;
            }
            var value = values[i];
            this.addItem(name, value, options);
            num++;
        }

        //close on leave? touch enabled devices won't work TODO use a global device detector and condition on that
        /*LiteGraph.pointerListenerAdd(root,"leave", function(e) {
		  	console.log("pointerevents: ContextMenu leave");
            if (that.lock) {
                return;
            }
            if (root.closing_timer) {
                clearTimeout(root.closing_timer);
            }
            root.closing_timer = setTimeout(that.close.bind(that, e), 500);
            //that.close(e);
        });*/

		LiteGraph.pointerListenerAdd(root,"enter", function(e) {
		  	//console.log("pointerevents: ContextMenu enter");
            if (root.closing_timer) {
                clearTimeout(root.closing_timer);
            }
        });

        //insert before checking position
        var root_document = document;
        if (options.event) {
            root_document = options.event.target.ownerDocument;
        }

        if (!root_document) {
            root_document = document;
        }

		if( root_document.fullscreenElement )
	        root_document.fullscreenElement.appendChild(root);
		else
		    root_document.body.appendChild(root);

        //compute best position
        var left = options.left || 0;
        var top = options.top || 0;
        if (options.event) {
            left = options.event.clientX - 10;
            top = options.event.clientY - 10;
            if (options.title) {
                top -= 20;
            }

            if (options.parentMenu) {
                var rect = options.parentMenu.root.getBoundingClientRect();
                left = rect.left + rect.width;
            }

            var body_rect = document.body.getBoundingClientRect();
            var root_rect = root.getBoundingClientRect();
			if(body_rect.height == 0)
				console.error("document.body height is 0. That is dangerous, set html,body { height: 100%; }");

            if (body_rect.width && left > body_rect.width - root_rect.width - 10) {
                left = body_rect.width - root_rect.width - 10;
            }
            if (body_rect.height && top > body_rect.height - root_rect.height - 10) {
                top = body_rect.height - root_rect.height - 10;
            }
        }

        root.style.left = left + "px";
        root.style.top = top + "px";

        if (options.scale) {
            root.style.transform = "scale(" + options.scale + ")";
        }
    }

    ContextMenu.prototype.addItem = function(name, value, options) {
        var that = this;
        options = options || {};

        var element = document.createElement("div");
        element.className = "litemenu-entry submenu";

        var disabled = false;

        if (value === null) {
            element.classList.add("separator");
            //element.innerHTML = "<hr/>"
            //continue;
        } else {
            element.innerHTML = value && value.title ? value.title : name;
            element.value = value;
            element.setAttribute("role", "menuitem");

            if (value) {
                if (value.disabled) {
                    disabled = true;
                    element.classList.add("disabled");
                    element.setAttribute("aria-disabled", "true");
                }
                if (value.submenu || value.has_submenu) {
                    element.classList.add("has_submenu");
                    element.setAttribute("aria-haspopup", "true");
                    element.setAttribute("aria-expanded", "false");
                }
            }

            if (typeof value == "function") {
                element.dataset["value"] = name;
                element.onclick_callback = value;
            } else {
                element.dataset["value"] = value;
            }

            if (value.className) {
                element.className += " " + value.className;
            }
        }

        this.root.appendChild(element);
        if (!disabled) {
            element.addEventListener("click", inner_onclick);
        }
        if (!disabled && options.autoopen) {
			LiteGraph.pointerListenerAdd(element,"enter",inner_over);
        }

        function setAriaExpanded() {
            const entries = that.root.querySelectorAll("div.litemenu-entry.has_submenu");
            if (entries) {
                for (let i = 0; i < entries.length; i++) {
                    entries[i].setAttribute("aria-expanded", "false");
                }
            }
            element.setAttribute("aria-expanded", "true");
        }

        function inner_over(e) {
            var value = this.value;
            if (!value || !value.has_submenu) {
                return;
            }
            //if it is a submenu, autoopen like the item was clicked
            inner_onclick.call(this, e);
            setAriaExpanded();
        }

        //menu option clicked
        function inner_onclick(e) {
            var value = this.value;
            var close_parent = true;

            if (that.current_submenu) {
                that.current_submenu.close(e);
            }
            if (value?.has_submenu || value?.submenu) {
                setAriaExpanded();
            }

            //global callback
            if (options.callback) {
                var r = options.callback.call(
                    this,
                    value,
                    options,
                    e,
                    that,
                    options.node
                );
                if (r === true) {
                    close_parent = false;
                }
            }

            //special cases
            if (value) {
                if (
                    value.callback &&
                    !options.ignore_item_callbacks &&
                    value.disabled !== true
                ) {
                    //item callback
                    var r = value.callback.call(
                        this,
                        value,
                        options,
                        e,
                        that,
                        options.extra
                    );
                    if (r === true) {
                        close_parent = false;
                    }
                }
                if (value.submenu) {
                    if (!value.submenu.options) {
                        throw "ContextMenu submenu needs options";
                    }
                    var submenu = new that.constructor(value.submenu.options, {
                        callback: value.submenu.callback,
                        event: e,
                        parentMenu: that,
                        ignore_item_callbacks:
                            value.submenu.ignore_item_callbacks,
                        title: value.submenu.title,
                        extra: value.submenu.extra,
                        autoopen: options.autoopen
                    });
                    close_parent = false;
                }
            }

            if (close_parent && !that.lock) {
                that.close();
            }
        }

        return element;
    };

    ContextMenu.prototype.close = function(e, ignore_parent_menu) {
        if (this.root.parentNode) {
            this.root.parentNode.removeChild(this.root);
        }
        if (this.parentMenu && !ignore_parent_menu) {
            this.parentMenu.lock = false;
            this.parentMenu.current_submenu = null;
            if (e === undefined) {
                this.parentMenu.close();
            } else if (
                e &&
                !ContextMenu.isCursorOverElement(e, this.parentMenu.root)
            ) {
                ContextMenu.trigger(this.parentMenu.root, LiteGraph.pointerevents_method+"leave", e);
            }
        }
        if (this.current_submenu) {
            this.current_submenu.close(e, true);
        }

        if (this.root.closing_timer) {
            clearTimeout(this.root.closing_timer);
        }
        
        // TODO implement : LiteGraph.contextMenuClosed(); :: keep track of opened / closed / current ContextMenu
        // on key press, allow filtering/selecting the context menu elements
    };

    //this code is used to trigger events easily (used in the context menu mouseleave
    ContextMenu.trigger = function(element, event_name, params, origin) {
        var evt = document.createEvent("CustomEvent");
        evt.initCustomEvent(event_name, true, true, params); //canBubble, cancelable, detail
        evt.srcElement = origin;
        if (element.dispatchEvent) {
            element.dispatchEvent(evt);
        } else if (element.__events) {
            element.__events.dispatchEvent(evt);
        }
        //else nothing seems binded here so nothing to do
        return evt;
    };

    //returns the top most menu
    ContextMenu.prototype.getTopMenu = function() {
        if (this.options.parentMenu) {
            return this.options.parentMenu.getTopMenu();
        }
        return this;
    };

    ContextMenu.prototype.getFirstEvent = function() {
        if (this.options.parentMenu) {
            return this.options.parentMenu.getFirstEvent();
        }
        return this.options.event;
    };

    ContextMenu.isCursorOverElement = function(event, element) {
        var left = event.clientX;
        var top = event.clientY;
        var rect = element.getBoundingClientRect();
        if (!rect) {
            return false;
        }
        if (
            top > rect.top &&
            top < rect.top + rect.height &&
            left > rect.left &&
            left < rect.left + rect.width
        ) {
            return true;
        }
        return false;
    };

    LiteGraph.ContextMenu = ContextMenu;

    LiteGraph.closeAllContextMenus = function(ref_window) {
        ref_window = ref_window || window;

        var elements = ref_window.document.querySelectorAll(".litecontextmenu");
        if (!elements.length) {
            return;
        }

        var result = [];
        for (var i = 0; i < elements.length; i++) {
            result.push(elements[i]);
        }

        for (var i=0; i < result.length; i++) {
            if (result[i].close) {
                result[i].close();
            } else if (result[i].parentNode) {
                result[i].parentNode.removeChild(result[i]);
            }
        }
    };

    LiteGraph.extendClass = function(target, origin) {
        for (var i in origin) {
            //copy class properties
            if (target.hasOwnProperty(i)) {
                continue;
            }
            target[i] = origin[i];
        }

        if (origin.prototype) {
            //copy prototype properties
            for (var i in origin.prototype) {
                //only enumerable
                if (!origin.prototype.hasOwnProperty(i)) {
                    continue;
                }

                if (target.prototype.hasOwnProperty(i)) {
                    //avoid overwriting existing ones
                    continue;
                }

                //copy getters
                if (origin.prototype.__lookupGetter__(i)) {
                    target.prototype.__defineGetter__(
                        i,
                        origin.prototype.__lookupGetter__(i)
                    );
                } else {
                    target.prototype[i] = origin.prototype[i];
                }

                //and setters
                if (origin.prototype.__lookupSetter__(i)) {
                    target.prototype.__defineSetter__(
                        i,
                        origin.prototype.__lookupSetter__(i)
                    );
                }
            }
        }
    };

	//used by some widgets to render a curve editor
	function CurveEditor( points )
	{
		this.points = points;
		this.selected = -1;
		this.nearest = -1;
		this.size = null; //stores last size used
		this.must_update = true;
		this.margin = 5;
	}

	CurveEditor.sampleCurve = function(f,points)
	{
		if(!points)
			return;
		for(var i = 0; i < points.length - 1; ++i)
		{
			var p = points[i];
			var pn = points[i+1];
			if(pn[0] < f)
				continue;
			var r = (pn[0] - p[0]);
			if( Math.abs(r) < 0.00001 )
				return p[1];
			var local_f = (f - p[0]) / r;
			return p[1] * (1.0 - local_f) + pn[1] * local_f;
		}
		return 0;
	}

	CurveEditor.prototype.draw = function( ctx, size, graphcanvas, background_color, line_color, inactive )
	{
		var points = this.points;
		if(!points)
			return;
		this.size = size;
		var w = size[0] - this.margin * 2;
		var h = size[1] - this.margin * 2;

		line_color = line_color || "#666";

		ctx.save();
		ctx.translate(this.margin,this.margin);

		if(background_color)
		{
			ctx.fillStyle = "#111";
			ctx.fillRect(0,0,w,h);
			ctx.fillStyle = "#222";
			ctx.fillRect(w*0.5,0,1,h);
			ctx.strokeStyle = "#333";
			ctx.strokeRect(0,0,w,h);
		}
		ctx.strokeStyle = line_color;
		if(inactive)
			ctx.globalAlpha = 0.5;
		ctx.beginPath();
		for(var i = 0; i < points.length; ++i)
		{
			var p = points[i];
			ctx.lineTo( p[0] * w, (1.0 - p[1]) * h );
		}
		ctx.stroke();
		ctx.globalAlpha = 1;
		if(!inactive)
			for(var i = 0; i < points.length; ++i)
			{
				var p = points[i];
				ctx.fillStyle = this.selected == i ? "#FFF" : (this.nearest == i ? "#DDD" : "#AAA");
				ctx.beginPath();
				ctx.arc( p[0] * w, (1.0 - p[1]) * h, 2, 0, Math.PI * 2 );
				ctx.fill();
			}
		ctx.restore();
	}

	//localpos is mouse in curve editor space
	CurveEditor.prototype.onMouseDown = function( localpos, graphcanvas )
	{
		var points = this.points;
		if(!points)
			return;
		if( localpos[1] < 0 )
			return;

		//this.captureInput(true);
		var w = this.size[0] - this.margin * 2;
		var h = this.size[1] - this.margin * 2;
		var x = localpos[0] - this.margin;
		var y = localpos[1] - this.margin;
		var pos = [x,y];
		var max_dist = 30 / graphcanvas.ds.scale;
		//search closer one
		this.selected = this.getCloserPoint(pos, max_dist);
		//create one
		if(this.selected == -1)
		{
			var point = [x / w, 1 - y / h];
			points.push(point);
			points.sort(function(a,b){ return a[0] - b[0]; });
			this.selected = points.indexOf(point);
			this.must_update = true;
		}
		if(this.selected != -1)
			return true;
	}

	CurveEditor.prototype.onMouseMove = function( localpos, graphcanvas )
	{
		var points = this.points;
		if(!points)
			return;
		var s = this.selected;
		if(s < 0)
			return;
		var x = (localpos[0] - this.margin) / (this.size[0] - this.margin * 2 );
		var y = (localpos[1] - this.margin) / (this.size[1] - this.margin * 2 );
		var curvepos = [(localpos[0] - this.margin),(localpos[1] - this.margin)];
		var max_dist = 30 / graphcanvas.ds.scale;
		this._nearest = this.getCloserPoint(curvepos, max_dist);
		var point = points[s];
		if(point)
		{
			var is_edge_point = s == 0 || s == points.length - 1;
			if( !is_edge_point && (localpos[0] < -10 || localpos[0] > this.size[0] + 10 || localpos[1] < -10 || localpos[1] > this.size[1] + 10) )
			{
				points.splice(s,1);
				this.selected = -1;
				return;
			}
			if( !is_edge_point ) //not edges
				point[0] = clamp(x, 0, 1);
			else
				point[0] = s == 0 ? 0 : 1;
			point[1] = 1.0 - clamp(y, 0, 1);
			points.sort(function(a,b){ return a[0] - b[0]; });
			this.selected = points.indexOf(point);
			this.must_update = true;
		}
	}

	CurveEditor.prototype.onMouseUp = function( localpos, graphcanvas )
	{
		this.selected = -1;
		return false;
	}

	CurveEditor.prototype.getCloserPoint = function(pos, max_dist)
	{
		var points = this.points;
		if(!points)
			return -1;
		max_dist = max_dist || 30;
		var w = (this.size[0] - this.margin * 2);
		var h = (this.size[1] - this.margin * 2);
		var num = points.length;
		var p2 = [0,0];
		var min_dist = 1000000;
		var closest = -1;
		var last_valid = -1;
		for(var i = 0; i < num; ++i)
		{
			var p = points[i];
			p2[0] = p[0] * w;
			p2[1] = (1.0 - p[1]) * h;
			if(p2[0] < pos[0])
				last_valid = i;
			var dist = vec2.distance(pos,p2);
			if(dist > min_dist || dist > max_dist)
				continue;
			closest = i;
			min_dist = dist;
		}
		return closest;
	}

	LiteGraph.CurveEditor = CurveEditor;

    //used to create nodes from wrapping functions
    LiteGraph.getParameterNames = function(func) {
        return (func + "")
            .replace(/[/][/].*$/gm, "") // strip single-line comments
            .replace(/\s+/g, "") // strip white space
            .replace(/[/][*][^/*]*[*][/]/g, "") // strip multi-line comments  /**/
            .split("){", 1)[0]
            .replace(/^[^(]*[(]/, "") // extract the parameters
            .replace(/=[^,]+/g, "") // strip any ES6 defaults
            .split(",")
            .filter(Boolean); // split & filter [""]
    };

	/* helper for interaction: pointer, touch, mouse Listeners
	used by LGraphCanvas DragAndScale ContextMenu*/
	LiteGraph.pointerListenerAdd = function(oDOM, sEvIn, fCall, capture=false) {
		if (!oDOM || !oDOM.addEventListener || !sEvIn || typeof fCall!=="function"){
			//console.log("cant pointerListenerAdd "+oDOM+", "+sEvent+", "+fCall);
			return; // -- break --
		}
		
		var sMethod = LiteGraph.pointerevents_method;
		var sEvent = sEvIn;
		
		// UNDER CONSTRUCTION
		// convert pointerevents to touch event when not available
		if (sMethod=="pointer" && !window.PointerEvent){ 
			console.warn("sMethod=='pointer' && !window.PointerEvent");
			console.log("Converting pointer["+sEvent+"] : down move up cancel enter TO touchstart touchmove touchend, etc ..");
			switch(sEvent){
				case "down":{
					sMethod = "touch";
					sEvent = "start";
					break;
				}
				case "move":{
					sMethod = "touch";
					//sEvent = "move";
					break;
				}
				case "up":{
					sMethod = "touch";
					sEvent = "end";
					break;
				}
				case "cancel":{
					sMethod = "touch";
					//sEvent = "cancel";
					break;
				}
				case "enter":{
					console.log("debug: Should I send a move event?"); // ???
					break;
				}
				// case "over": case "out": not used at now
				default:{
					console.warn("PointerEvent not available in this browser ? The event "+sEvent+" would not be called");
				}
			}
		}

		switch(sEvent){
			//both pointer and move events
			case "down": case "up": case "move": case "over": case "out": case "enter":
			{
				oDOM.addEventListener(sMethod+sEvent, fCall, capture);
			}
			// only pointerevents
			case "leave": case "cancel": case "gotpointercapture": case "lostpointercapture":
			{
				if (sMethod!="mouse"){
					return oDOM.addEventListener(sMethod+sEvent, fCall, capture);
				}
			}
			// not "pointer" || "mouse"
			default:
				return oDOM.addEventListener(sEvent, fCall, capture);
		}
	}
	LiteGraph.pointerListenerRemove = function(oDOM, sEvent, fCall, capture=false) {
		if (!oDOM || !oDOM.removeEventListener || !sEvent || typeof fCall!=="function"){
			//console.log("cant pointerListenerRemove "+oDOM+", "+sEvent+", "+fCall);
			return; // -- break --
		}
		switch(sEvent){
			//both pointer and move events
			case "down": case "up": case "move": case "over": case "out": case "enter":
			{
				if (LiteGraph.pointerevents_method=="pointer" || LiteGraph.pointerevents_method=="mouse"){
					oDOM.removeEventListener(LiteGraph.pointerevents_method+sEvent, fCall, capture);
				}
			}
			// only pointerevents
			case "leave": case "cancel": case "gotpointercapture": case "lostpointercapture":
			{
				if (LiteGraph.pointerevents_method=="pointer"){
					return oDOM.removeEventListener(LiteGraph.pointerevents_method+sEvent, fCall, capture);
				}
			}
			// not "pointer" || "mouse"
			default:
				return oDOM.removeEventListener(sEvent, fCall, capture);
		}
	}

    function clamp(v, a, b) {
        return a > v ? a : b < v ? b : v;
    };
    globalThis.clamp = clamp;

    if (typeof window != "undefined" && !window["requestAnimationFrame"]) {
        window.requestAnimationFrame =
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            function(callback) {
                window.setTimeout(callback, 1000 / 60);
            };
    }
})(globalExport)

export const LiteGraph = globalExport.LiteGraph;
export const LGraph = globalExport.LGraph;
export const LLink = globalExport.LLink;
export const LGraphNode = globalExport.LGraphNode;
export const LGraphGroup = globalExport.LGraphGroup;
export const DragAndScale = globalExport.DragAndScale;
export const LGraphCanvas = globalExport.LGraphCanvas;
export const ContextMenu = globalExport.ContextMenu;
export { LGraphBadge, BadgePosition } from "./LGraphBadge";
