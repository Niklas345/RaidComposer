/**
 * Created by Niklas on 06.02.2016.
 */

//! @brief Constructs a complete Raid Setup from the given JSON string
//!        Some of the functions are closely tied to the DOM structure it
//!        generates via "toTable".
//! @param  inputJSON JSON Input String
//! @param  updateFunctionName  Name of the function that is used to communicate with the DOM Structure
//!                             Function name is without ().
function RaidSetup(inputJSON, updateFunctionName)
{
    // Raid data. JSON object, array of bosses which contains information
    this._rawData = inputJSON;

    // Raid Setup data
    this._data = null;

    // associative array that maps a "uID" identifier into
    // 2 integer indizees representing a specific player in the complete setup
    this._mappings = null;

    this.upFunc = updateFunctionName;


    // Prefix used for unqiue IDs for the player name input fields. Is combined with
    // the current position ID to form an unique selector of the current name input field.
    this._inputFieldPrefix = "RaidPlanInpt";


    this.mapping = function(indexBoss, indexPlayer)
    {
        this.playerIndex = indexPlayer;
        this.bossIndex = indexBoss;
    }

    this.createMapping = function()
    {
        this._mappings = new Array();
        for(var i = 0; i < this._data.RaidTeam.length; i++)
        {
            var bData = this._data.RaidTeam[i];
            for(var j = 0; j < bData.teamSetup.classes.length; j++)
            {
                this._mappings[bData.teamSetup.classes[j].uID] = new this.mapping(i,j);
            }
        }
        console.log(this._mappings);
    }

    this._addSpecialRoles = function(playerData)
    {
        var res = '';
        for(var i = 0; i < playerData.specialRoles.length; i++)
        {
            res += playerData.specialRoles[i] + ", ";
        }
        return res;
    }

    //! @brief  creates a single table based on the given JSON object bossData
    //! @param  bossData    The data for the boss. Structure:
    //!                     id : id for table
    //!                     name : bossname
    //1                     teamSetup : array of object with members (pName, pRole, uID)
    //!                     size : size of the party
    //! @return HTML String rep of the whole table
    this._oneTable = function(bossData)
    {
        var res = '';
        res = res + "<div class='col-md-4'>";
        res = res + "<table id='" + bossData.id + "' class='table table-condensed table-bordered table-striped'>";
        res = res + "<caption>" + bossData.name + "</caption>";
        res = res + "<tr><th>Role</th><th>Name</th><th>Team</th><th>Special</th></tr>";
        for(var i = 0; i < bossData.teamSetup.classes.length; i++)
        {
            res = res + "<tr id='" + bossData.teamSetup.classes[i].uID + "'>\n";
            res = res + "<td>" + bossData.teamSetup.classes[i].pRole + "</td>\n";
            res = res + "<td>";
            res = res + "<input id='" + this._inputFieldPrefix + bossData.teamSetup.classes[i].uID + "' ";
            res = res + "value='" + bossData.teamSetup.classes[i].pName + "'";
            res = res + "onkeyup='"+ this.upFunc + "(" + "&quot;" + bossData.teamSetup.classes[i].uID + "&quot;" + ")'>";
            res = res + "</td>";
            if(bossData.teamSetup.classes[i].pTeam != null) {
                res = res + "<td>" + bossData.teamSetup.classes[i].pTeam + "</td>";
            }
            else {
                res = res + "<td>-</td>";
            }
            if(bossData.teamSetup.classes[i].specialRoles != null) {
                res = res + "<td>" + this._addSpecialRoles(bossData.teamSetup.classes[i]) + "</td>";
            } else {
                res = res + "<td>-</td>";
            }

            res = res + "</tr>\n"
        }
        res += "</table>";
        res += "</div>";
        return res;
    };

    //! @brief processes the given raw json data into a raid setup
    this.create = function() {
        try {
            this._data = JSON.parse(this._rawData);

        }
        catch(e)
        {
            alert("Error while parsing data. Exception is logged to console.")
            console.log(e);
        }
        this.createMapping();
    };

    //! @brief  creates a table representation of the raid setup.
    //!         for each td element, the unqize party member IDs are being used
    //!         for each boss subtable, the uniqze boss ID is being used
    //! @return tables for each boss.
    this.toTable = function() {
        var tables = '';
        for(var i = 0; i < this._data.RaidTeam.length; i++)
        {
            tables = tables + this._oneTable(this._data.RaidTeam[i]);
        }
        return tables;

    };

    /* //! @brief  Updates the player names of the given boss team composition
     //!         A table with given unqiue input identifiers has to be able
     //!         this table is being create bei toTable function
     this.updateBossNames = function(bossData)
     {
     for(var i = 0; i < bossData.teamSetup.classes.length; i++)
     {
     bossData.teamSetup.classes[i].pName =
     $('#' + this._inputFieldPrefix + bossData.teamSetup.classes[i].uID).val();
     }
     };

     //! @brief  Updates all player data with data from the given tables in tableContainerID container
     this.updateSetup = function(tableContainerID)
     {
     for(var i = 0; i < this._data.RaidTeam.length; i++)
     {
     this.updateBossNames(this._data.RaidTeam[i]);
     }
     console.log(this._data);
     };*/
    this.updateName = function(uID, name)
    {
        var ind = this._mappings[uID];
        console.log(ind);
        console.log(name);
        this._data.RaidTeam[ind.bossIndex].teamSetup.classes[ind.playerIndex].pName = name;
    }

    //! @brief  returns a string rep of the given boss team
    this.bossTeamToString = function(bossData)
    {
        var res = "";
        for(var i = 0; i < bossData.teamSetup.classes.length; i++)
        {
            res += bossData.teamSetup.classes[i].pName;
            res += " - ";
            res += bossData.teamSetup.classes[i].pRole;
            if(i < bossData.teamSetup.classes.length - 1 )
            {

                res += " | ";
            }
        }
        return res;
    };

    //! @brief  Returns a string rep of the raid composition
    //! @return string rep with pattern:
    //!         Bossname: player - role | player - role | ... | player - role \n
    //!         Bossname: ...etc...
    this.toString = function()
    {

        var res = '';
        for(var i = 0; i < this._data.RaidTeam.length; i++)
        {
            res += this._data.RaidTeam[i].name + ': ';
            res += this.bossTeamToString(this._data.RaidTeam[i]);
            res += "\n\n\n";
        }
        return res;
    };

    //! @brief  Returns a players class in the given setup
    //! @param  bossData    Setup data for one boss/group comp
    //! @param  pName       Player name
    this.getPlayerClass = function(bossData, pName)
    {
        var res;
        for(var i = 0; i < bossData.teamSetup.classes.length; i++)
        {
            if(bossData.teamSetup.classes[i].pName == pName)
            {
                res = bossData.teamSetup.classes[i].pRole;
            }
        }
        return res;
    };

    //! @brief  Returns player name at index pIndex
    this.getPlayerName = function(bossData, pIndex)
    {
        return bossData.teamSetup.classes[pIndex].pName;
    };


    //! @brief  Returns the raid team representation, sorted by players
    //! @return String rep in this form:
    //!         <pname> : <class> <class> <class> |
    this.toStringPlayerSorted = function()
    {
        var i = 0;
        var j = 0;
        var res ='';
        for(i = 0; i < this._data.RaidTeam[0].teamSetup.classes.length; i++)
        {
            var name = this.getPlayerName(this._data.RaidTeam[0], i);
            res += name;
            res += " : ";
            for(j = 0; j < this._data.RaidTeam.length; j++)
            {
                res += "<";
                res += this.getPlayerClass(this._data.RaidTeam[j], name);
                res += "> ";
            }
            res += "\n";
        }
        return res;
    };


    this._hasSpecialRole = function(pData)
    {
        return pData.specialRoles != null && pData.specialRoles.length >= 1;
    }

    //! @brief  Prints the Setup, sorted by special Roles per boss
    this.toStringSpecialBased = function()
    {
        var res = '';
        for(var i = 0; i < this._data.RaidTeam.length; i++)
        {
            res += this._data.RaidTeam[i].name + ": ";
            var classes = this._data.RaidTeam[i].teamSetup.classes;
            for(var j = 0; j < classes.length; j++)
            {

                if(this._hasSpecialRole(classes[j]))
                {
                    res += classes[j].pName + "->";
                    for(var k = 0; k < classes[j].specialRoles.length; k++)
                    {
                        res += classes[j].specialRoles[k];
                        if(k < classes[j].specialRoles.length - 1)
                            res += ", ";
                    }
                    res += " | "
                }

            }
            res += "\n";
            res += "\n";

        }
        return res;
    }

    //! @brief  Returns stringified JSON of setup, indented with 4 whitespace
    this.toJSONString = function()
    {
        return JSON.stringify(this._data, null, 4);
    }

    this.toJSON = function() {
        return JSON.stringify(this._data);
    }
}