/*
 * routes.js — moduł zapewniający routing.
*/



'use strict';
var configRoutes;  

  var mongodb     = require( 'mongodb' ),

  mongoServer = new mongodb.Server(
    'localhost',
    mongodb.Connection.DEFAULT_PORT
  ),
  dbHandle    = new mongodb.Db(
    'spa', mongoServer, { safe : true }
  ),

  makeMongoId = mongodb.ObjectID;



configRoutes = function ( app, server ) {
  app.get( '/', function ( request, response ) {
    response.redirect( '/spa.html' );
  });
  app.get( '/booking', function ( request, response ) {
    response.redirect( '/booking.html');
  });
  app.get( '/booked', function ( request, response ) {
    response.redirect( '/userBookings.html' );
  });
  app.all( '/:obj_type/*?', function ( request, response, next ) {
    response.contentType( 'json' );
    next();
  });

  app.get( '/:obj_type/list', function ( request, response ) {
    dbHandle.collection(
      request.params.obj_type,
      function ( outer_error, collection ) {
        collection.find().toArray(
          function ( inner_error, map_list ) {
            response.send( map_list );
          }
        );
      }
    );
  });

  app.get( '/:obj_type/list/:login', function ( request, response ) {
    var find_map = { userName: request.params.login };
    dbHandle.collection(
      request.params.obj_type,
      function ( outer_error, collection ) {
        collection.find(find_map).toArray(
          function ( inner_error, map_list ) {
            response.send( map_list );
          }
        );
      }
    );
  });

  app.post( '/:obj_type/create', function ( request, response ) {
console.log("obj_type: "+request.params.obj_type);
    dbHandle.collection(
      request.params.obj_type,
      function ( outer_error, collection ) {
        var
          options_map = { safe: true },
          obj_map     = request.body;
	   console.log("obj_map: "+obj_map+" obj name: "+obj_map.userName);
        collection.insert(
          obj_map,
          options_map,
          function ( inner_error, result_map ) {
		console.log("ellol: "+inner_error+" lesult map: "+result_map);
            response.send( result_map );
          }
        );
      }
    );
  });

  app.post( '/user/login', function ( request, response ) {
    var find_map = { login: request.body.login };
    dbHandle.collection(
      "user",
      function ( outer_error, collection ) {
        collection.findOne(
          find_map,
          function ( inner_error, result_map ) {
	    var res;
	    if(result_map!==null){
		    if(result_map.pass === request.body.pass){
			res = { status: "logged" }
		    }
		    else{
			res = { status: "error" }
		    }
	    }
	    else res = { status: "error" }
            response.send( res );
          }
        );
      }
    );
  });

  app.get( '/event/read/:id', function ( request, response ) {
    var find_map = { _id:  makeMongoId(request.params.id) };
    dbHandle.collection(
      "event",
      function ( outer_error, collection ) {
        collection.findOne(
          find_map,
          function ( inner_error, result_map ) {
            response.send( result_map );
          }
        );
      }
    );
  });

  app.post( '/:obj_type/update/:id', function ( request, response ) {
    var
      find_map = { _id: makeMongoId( request.params.id ) },
      obj_map  = request.body;
	console.log("find_map: "+find_map);
    dbHandle.collection(
      request.params.obj_type,
      function ( outer_error, collection ) {
        var
          sort_order = [],
          options_map = {
            'new' : true, upsert: false, safe: true
          };

        collection.findAndModify(
          find_map,
          sort_order,
          obj_map,
          options_map,
          function ( inner_error, updated_map ) {
            response.send( updated_map );
          }
        );
      }
    );
  });

  app.get( '/:obj_type/delete/:id', function ( request, response ) {
    var find_map = { _id: makeMongoId( request.params.id ) };

    dbHandle.collection(
      request.params.obj_type,
      function ( outer_error, collection ) {
        var options_map = { safe: true, single: true };

        collection.remove(
          find_map,
          options_map,
          function ( inner_error, delete_count ) {
            response.send({ delete_count: delete_count });
          }
        );
      }
    );
  });
};

module.exports = { configRoutes : configRoutes };


dbHandle.open( function () {
  console.log( '** Podłączony do MongoDB **' );
});
