'use strict';


module.exports = function(app, settings) {
  var path = require('path');
  var logger = require(path.join(__dirname, '../logger/logger.js'));
  var models = require(path.join(__dirname, '../models'))(settings.db);

  app.put('/v2/service_instances/:instanceId', function(req, res) {
    var serviceInstanceId = req.params.instanceId;
    var orgId = req.body.organization_guid;
    var spaceId = req.body.space_guid;
    
    models.service_instance.findOrCreate({
      serviceInstanceId: serviceInstanceId,
      orgId: orgId,
      spaceId: spaceId,
      where: {
        serviceInstanceId: serviceInstanceId,
        orgId: orgId,
        spaceId: spaceId
      }
    }).then(function(result) {
      var isNew = result[1];
      if (isNew === true) {
        res.status(201);
      } else {
        res.status(200);
      }
      res.json({ "dashboard_url": "" });
    }).catch(function(err) {
      if (err instanceof models.sequelize.UniqueConstraintError) {
        res.status(409);
      } else {
        logger.error("Fail to handle request: ", {req: req, err: err} );
        res.status(500);
      }
      res.end();
    });

  });

  app.delete('/v2/service_instances/:instanceId', function(req, res) {
    var serviceInstanceId = req.params.instanceId;

    models.service_instance.findById(serviceInstanceId)
      .then(function(instance) {
        if (instance != null) {
          models.service_instance.destroy({
            where: {
              serviceInstanceId: serviceInstanceId
            }
          }).then(function(count) {
            res.status(200);
          });
        } else {
          res.status(410);
        }
        res.json({});
      }).catch(function(err) {
        logger.error("Fail to handle request: ", {req: req, err: err});
        res.status(500).end();
      });

  });

}