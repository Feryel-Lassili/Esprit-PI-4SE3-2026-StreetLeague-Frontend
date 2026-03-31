package tn.esprit.pi.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@CrossOrigin("*")
@RequestMapping("")
public class DemoController {

    @GetMapping("/student/hello")
    public String etu() {
        return "Hello STUDENT";
    }

    @GetMapping("/teacher/hello")
    public String ens() {
        return "Hello TEACHER";
    }
}
