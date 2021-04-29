import React, {  } from "react";
import { useFormik } from 'formik';
import * as yup from 'yup';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, TextField } from "@material-ui/core";


export default function EditAccountDialog(props) {
  const { onClose, open, user } = props;

  const cancel = () => {
    onClose(null);
  }

  const validationSchema = yup.object({
    name: yup.string()
      .max(60, "Deve ter 60 caracteres ou menos")
      .matches(/^([^0-9{}\\/()\]\[]*)$/, "Nome inválido")
      .required("Obrigatório"),
    email: yup.string()
      .email("E-mail inválido")
      .required("Obrigatório"),
  })

  const formik = useFormik({
    initialValues: {
      name: user.name,
      email: user.email
    },
    enableReinitialize: true,
    validationSchema: validationSchema,
    onSubmit: async (values, actions) => {
      await onClose({
        name: values.name,
        email: values.email
      })
      actions.resetForm();
    }
  })

  return (
    <Grid container>
      <Dialog open={open}>
        <DialogTitle>Editar Conta</DialogTitle>
        <DialogContent>
          <Grid container direction="column">
              <TextField
                variant="outlined"
                margin="normal"
                label="Nome"
                name="name"
                id="name"
                value={formik.values.name}
                onChange={formik.handleChange}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
              />
              <TextField 
                variant="outlined"
                margin="normal"
                label="E-mail"
                name="email"
                id="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
              />
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancel}>Cancelar</Button>
          <Button onClick={formik.handleSubmit}>Salvar</Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
}