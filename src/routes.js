const express = require("express");
const routes = express.Router();
//const basePath = __dirname + "/views";
const views = __dirname + "/views/";

const Profile = {
  data: {
    name: "Ivan Dias",
    avatar: "https://avatars.githubusercontent.com/u/105668055?v=4",
    "monthly-budget": 3000,
    "days-per-week": 5,
    "hours-per-day": 5,
    "vacation-per-year": 4,
    "value-hour": 75,
  },
  controllers: {
    index(req, res) {
      return res.render(views + "profile", { profile: Profile.data });
    },
    update(req, res) {
      //req.body para pegar os dados
      const data = req.body;
      //definir quyantas semanas tem em 1 ano
      const weeksPerYear = 52;
      //remover as semanas de ferias do ano para pegar quantas semanas tem em 1 mes
      const weeksPerMonth = (weeksPerYear - data["vacation-per-year"]) / 12;

      //quantas horas por semana quero trabalhar

      const weekTotalHours = data["hours-per-day"] * data["days-per-week"];
      //total horas trabalhadas no mes
      const monthlyTotalHours = weekTotalHours * weeksPerMonth;
      //qual valor da hora?
      const valueHour = data["monthly-budget"] / monthlyTotalHours;

      Profile.data = {
        ...Profile.data,
        ...req.body,
        "value-hour": valueHour,
      };
      return res.redirect("/profile");
    },
  },
};

const Job = {
  data: [
    {
      id: 1,
      name: "Pizaria Guloso",
      "daily-hours": 2,
      "total-hours": 60,
      createdAt: Date.now(),
    },
    {
      id: 2,
      name: "One two Project",
      "daily-hours": 3,
      "total-hours": 47,
      createdAt: Date.now(),
    },
  ],
  controllers: {
    index: (req, res) => {
      //ajustes no job
      //calc de tempo restante
      const upadatedJobs = Job.data.map((job) => {
        //ajuste no job
        const remaining = Job.services.remainingDays(job);
        const status = remaining <= 0 ? "done" : "progress";
        return {
          ...job,
          remaining,
          status,
          budget: Job.services.calculateBudget(job, Profile.data["value-hour"]),
        };
      });
      return res.render(views + "index", {
        jobs: upadatedJobs,
      });
    },
    create(req, res) {
      return res.render(views + "job");
    },
    save: (req, res) => {
      const lastId = Job.data[Job.data.length - 1]?.id || 0; //traz a posicão anterior a quantidade ex  0 1 2 3... o leght é 4 -1 = 3 ? significa não existe
      Job.data.push({
        id: lastId + 1,
        name: req.body.name,
        "daily-hours": req.body["daily-hours"],
        "total-hours": req.body["total-hours"],
        createdAt: Date.now(), //atribuido data/hora/sec de hj
      });

      return res.redirect("/");
    },
    show(req, res) {
      const jobId = req.params.id;

      ///se job.id === jobId = true
      const job = Job.data.find((job) => Number(job.id) == Number(jobId));

      if (!job) {
        return res.send("Job not found!");
      }
      job.budget = Job.services.calculateBudget(
        job,
        Profile.data["value-hour"]
      );

      return res.render(views + "job-edit", { job });
    },
    update(req, res) {
      const jobId = req.params.id;
      console.log(jobId);
      ///se job.id === jobId = true
      const job = Job.data.find((job) => Number(job.id) == Number(jobId));
      if (!job) {
        return res.send("Job not found!");
      }

      const upadatedJob = {
        ...job,
        name: req.body.name,
        "total-hours": req.body["total-hours"],
        "daily-hours": req.body["daily-hours"],
      };
      Job.data = Job.data.map((job) => {
        if (Number(job.id) === Number(jobId)) {
          job = upadatedJob;
        }
        return job;
      });
      res.redirect("/job/" + jobId);
    },
    delete(req, res) {
      const jobId = req.params.id;

      Job.data = Job.data.filter((job) => Number(job.id) !== Number(jobId));
      return res.redirect("/");
    },
  },
  services: {
    remainingDays(job) {
      const remainingDays = (job["total-hours"] / job["daily-hours"]).toFixed();

      const createdDate = new Date(job.createdAt);
      const dueDay = createdDate.getDate() + Number(remainingDays);
      const dueDateInMs = createdDate.setDate(dueDay);
      const timeDiffInMs = dueDateInMs - Date.now();
      //transforma ms em dias
      const dayInMs = 1000 * 60 * 60 * 24;
      const dayDiff = Math.floor(timeDiffInMs / dayInMs).toFixed(); //Math.florr arredonda p baixo
      return dayDiff;
    },
    calculateBudget: (job, valueHour) => valueHour * job["total-hours"],
  },
};

routes.get("/", Job.controllers.index);
routes.get("/job", Job.controllers.create);
routes.post("/job", Job.controllers.save);
routes.get("/job/:id", Job.controllers.show);
routes.post("/job/:id", Job.controllers.update);
routes.post("/job/delete/:id", Job.controllers.delete);
routes.get("/profile", Profile.controllers.index);
routes.post("/profile", Profile.controllers.update);

module.exports = routes;
