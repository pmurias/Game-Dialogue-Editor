angular.filter.label = function(reaction) {
    if (reaction.text.length == 0 || reaction.text[0] == '') {
        return 'reaction with empty text';
    } else {
        return reaction.text[0];
    }

}

var id = 0;
function genId() {
    return "id"+(++id);
}
function quote(str) {
    return '"'+str+'"';
}

default_duration = '3.0f';
angular.filter.csharp = function(reactionsAndStuff) {
    var reactions = reactionsAndStuff.reactions;
    var code = '';
    var ids = [];
    for (var i in reactions) {
        ids[i] = genId();
        code += "TalkReaction "+ids[i]+" = new TalkReaction();\n";
    }
 
    var root = reactionsAndStuff.root_reaction_id;
    code += "TalkReactions "+ root + ";\n";
    for (var i in reactionsAndStuff.root_reactions) {
	code += root + ".Reactions.Add(" + ids[i] + ");\n";
    }
	

    for (var i in reactions) {
        var r = ids[i];
        for (var j in reactions[i].text) {
            code += r+'.Text.Add(new TalkText(' + quote(reactions[i].text[j]) + ',' + default_duration + '));\n';

        }

        if (reactions[i].conditions) {
            code += r+ ".Conditions += ( () => "+ reactions[i].conditions + ");\n";
        }
        if (reactions[i].actions) {
            code += r+ ".Actions += ( () => "+ reactions[i].actions + ");\n";
        }

        for (var j in reactions[i].replies) {
            var reply = reactions[i].replies[j];
            var replyId = genId();
            code += 'TalkReply '+replyId + ' = new TalkReply();\n'
            code += r + '.Replies.Add(' + replyId + ');\n';

            if (reply.conditions) {
                code += replyId+ ".Conditions += ( () => "+ reply.conditions + ");\n";
            }
            if (reply.actions) {
                code += replyId+ ".Actions += ( () => "+ reply.actions + ");\n";
            }

            if (reply.ending) {
    		code += replyId + '.IsEnding = true;\n';
            }
            for (var t in reply.text) {
                code +=  replyId+'.Text.Add(new TalkText(' + quote(reply.text[t]) + ',' + default_duration + '));\n';
            }
            var reactionsId = genId();
            code += "TalkReactions "+reactionsId+" = new TalkReactions();\n";
            for (var h in reply.reactions) {
                code += reactionsId + ".Reactions.Add(" + ids[reply.reactions[h]] + ");\n";
            }
            code += replyId+".Response = "+reactionsId+";\n";
        }

    }
    return code;
}


function ReactionController() {
}
ReactionController.prototype = {
    addText: function() {
        this.reactions[this.selected_reaction].text.push("");
    },
    addReply: function() {
        this.reactions[this.selected_reaction].replies.push({text:[""],reactions:[]});
    },
    reaction: function() {
        if (this.reactions.length) {
            return this.reactions[this.selected_reaction];
        } else {
            return {};
        }
    }
};

angular.service('myApplication',function($resource) {
    this.res = $resource('/dialogue');
//    alert(this.res);
},{$inject:['$resource'],$creation:'eager'});

//angular.service('myApplication',function() { alert('there'); },{inject:[]});

function ReactionsController() {
}
ReactionsController.prototype = {
    addReaction: function() {
        this.reactions.push({
            text:[''],
            replies:[],
            action: '',
            conditions: ''
        });
    },
    addRootReaction: function() {
        this.root_reactions.push(0);
    },
    fetch: function() {
        var result;
        var scope = this;
        result = this.res.get(function() {
            scope.reactions = result.reactions;
	    scope.root_reactions = result.root_reactions;
            scope.root_reaction_id = result.root_reaction_id;
	});
    },
    save: function() {
        this.res.save(this.reactionsAndStuff());
    },
    reactionsAndStuff: function() {
	return {reactions:this.reactions,root_reactions:this.root_reactions,root_reaction_id:this.root_reaction_id};
    }
};

function ReplyController() {
}
ReplyController.prototype = {
    addReaction: function() {
        this.reply.reactions.push(0);
    },
    addText: function() {
        this.reply.text.push("");
    }
};

